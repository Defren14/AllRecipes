import { render, screen, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Recipe from './Recipe';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(() => null),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock fetch
global.fetch = vi.fn();

// Mock environment variable
vi.mock('import.meta.env', () => ({
  VITE_RECIPE_API_KEY: 'mock-api-key',
}));

// Mock useParams
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(() => ({ name: '123' })),
  };
});

// Mock contexts
vi.mock('../context/FavoritesContext.jsx', () => ({
  FavoritesProvider: ({ children }) => <div>{children}</div>,
  useFavorites: () => ({
    favorites: [],
    addToFavorites: vi.fn(),
    removeFromFavorites: vi.fn(),
    isFavorited: vi.fn(),
    toggleFavorite: vi.fn(),
  }),
}));

vi.mock('../context/AuthContext.jsx', () => ({
  AuthProvider: ({ children }) => <div>{children}</div>,
  useAuth: () => ({
    currentUser: null,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  }),
}));

vi.mock('../context/ThemeContext.jsx', () => ({
  ThemeProvider: ({ children }) => <div>{children}</div>,
  useTheme: () => ({
    theme: 'light',
    toggleTheme: vi.fn(),
  }),
}));

// Mock child components that might cause issues
vi.mock('../components/FavoriteButton', () => ({
  default: () => <div>FavoriteButton Mock</div>,
}));

vi.mock('../components/reviews/ReviewSection', () => ({
  default: () => <div>ReviewSection Mock</div>,
}));

describe('Recipe Component - localStorage Saving', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const mockRecipeDetails = {
    id: 123,
    title: 'Test Recipe',
    image: 'test-image.jpg',
    summary: 'Test summary',
    instructions: 'Test instructions',
    extendedIngredients: [],
    analyzedInstructions: [{ steps: [] }],
  };

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <Recipe />
      </MemoryRouter>
    );
  };

  it('saves recipe to recentlyViewed localStorage on mount', async () => {
    // Mock fetch to return recipe details
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockRecipeDetails),
    });

    // Mock localStorage getItem to return empty for recentlyViewed
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'recentlyViewed') return null;
      if (key === 'allRecipesUser') return null;
      return null;
    });

    renderComponent('123');

    // Wait for the component to mount and effects to run
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith('recentlyViewed', '123,');
    });
  });

  it('prepends recipe to existing recentlyViewed list', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockRecipeDetails),
    });

    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'recentlyViewed') return '456,789';
      if (key === 'allRecipesUser') return null;
      return null;
    });

    renderComponent('123');

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith('recentlyViewed', '123,456,789');
    });
  });

  it('limits recentlyViewed to 10 recipes', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockRecipeDetails),
    });

    // Create a string with 10 recipes (each ~7 chars: '123,' x10 = 40, but limit is 71, so make it longer)
    const longList = '1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20'; // This is over 71 chars
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'recentlyViewed') return longList;
      if (key === 'allRecipesUser') return null;
      return null;
    });

    renderComponent('123');

    await waitFor(() => {
      const call = localStorageMock.setItem.mock.calls.find(call => call[0] === 'recentlyViewed');
      expect(call[1]).toBe('123,' + longList.substring(0, 69));
    });
  });

  it('saves recipe details to recentRecipes when details are loaded', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockRecipeDetails),
    });

    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'recentlyViewed') return null;
      if (key === 'allRecipesUser') return null;
      if (key === 'recentRecipes') return null;
      return null;
    });

    renderComponent('123');

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'recentRecipes',
        JSON.stringify([
          {
            id: 123,
            title: 'Test Recipe',
            image: 'test-image.jpg',
          },
        ])
      );
    });
  });

  it('prepends to existing recentRecipes and removes duplicates', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockRecipeDetails),
    });

    const existingRecipes = [
      { id: 456, title: 'Recipe 456', image: 'img456.jpg' },
      { id: 123, title: 'Old Test Recipe', image: 'old-img.jpg' }, // Duplicate
    ];
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'recentlyViewed') return null;
      if (key === 'allRecipesUser') return null;
      if (key === 'recentRecipes') return JSON.stringify(existingRecipes);
      return null;
    });

    renderComponent('123');

    await waitFor(() => {
      const expected = [
        {
          id: 123,
          title: 'Test Recipe',
          image: 'test-image.jpg',
        },
        { id: 456, title: 'Recipe 456', image: 'img456.jpg' },
      ];
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'recentRecipes',
        JSON.stringify(expected)
      );
    });
  });

  it('limits recentRecipes to 10 items', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockRecipeDetails),
    });

    const existingRecipes = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      title: `Recipe ${i + 1}`,
      image: `img${i + 1}.jpg`,
    }));
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'recentlyViewed') return null;
      if (key === 'allRecipesUser') return null;
      if (key === 'recentRecipes') return JSON.stringify(existingRecipes);
      return null;
    });

    renderComponent('123');

    await waitFor(() => {
      const call = localStorageMock.setItem.mock.calls.find(call => call[0] === 'recentRecipes');
      const saved = JSON.parse(call[1]);
      expect(saved).toHaveLength(10);
      expect(saved[0]).toEqual({
        id: 123,
        title: 'Test Recipe',
        image: 'test-image.jpg',
      });
    });
  });

  it('handles API quota exceeded', async () => {
    fetch.mockResolvedValueOnce({
      status: 402,
      ok: false,
    });

    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'recentlyViewed') return null;
      if (key === 'allRecipesUser') return null;
      return null;
    });

    renderComponent('123');

    await waitFor(() => {
      expect(screen.getByText('Quota exceeded')).toBeInTheDocument();
    });

    // Still saves to localStorage
    expect(localStorageMock.setItem).toHaveBeenCalledWith('recentlyViewed', '123,');
  });

  it('handles fetch error gracefully', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'recentlyViewed') return null;
      if (key === 'allRecipesUser') return null;
      return null;
    });

    renderComponent('123');

    await waitFor(() => {
      // Component should still render loading state or handle error
      expect(localStorageMock.setItem).toHaveBeenCalledWith('recentlyViewed', '123,');
    });
  });

  it('handles API not found error', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'recentlyViewed') return null;
      if (key === 'allRecipesUser') return null;
      return null;
    });

    renderComponent('123');

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith('recentlyViewed', '123,');
    });
  });

  it('loads user from localStorage when logged in', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockRecipeDetails),
    });

    const userData = { isLoggedIn: true, uid: 'user123', email: 'test@example.com' };
    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'recentlyViewed') return null;
      if (key === 'allRecipesUser') return JSON.stringify(userData);
      return null;
    });

    renderComponent('123');

    await waitFor(() => {
      // The component should render without errors, and user is set
      expect(screen.getByText('Test Recipe')).toBeInTheDocument();
    });
  });

  it('handles invalid user data in localStorage', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockRecipeDetails),
    });

    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'recentlyViewed') return null;
      if (key === 'allRecipesUser') return 'invalid json';
      return null;
    });

    renderComponent('123');

    await waitFor(() => {
      expect(screen.getByText('Test Recipe')).toBeInTheDocument();
    });
  });

  it('renders ingredients when active is ingredients', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        ...mockRecipeDetails,
        extendedIngredients: [{ id: 1, name: 'Ingredient 1', amount: 100 }],
      }),
    });

    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'recentlyViewed') return null;
      if (key === 'allRecipesUser') return null;
      return null;
    });

    renderComponent('123');

    await waitFor(() => {
      expect(screen.getByText('Test Recipe')).toBeInTheDocument();
    });

    // Click ingredients button
    const ingredientsButton = screen.getByRole('button', { name: /ingredients/i });
    act(() => {
      ingredientsButton.click();
    });

    await waitFor(() => {
      expect(screen.getByText('Ingredient 1')).toBeInTheDocument();
    });
  });

  it('renders steps when active is steps', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        ...mockRecipeDetails,
        analyzedInstructions: [{ steps: [{ number: 1, step: 'Step 1' }] }],
      }),
    });

    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'recentlyViewed') return null;
      if (key === 'allRecipesUser') return null;
      return null;
    });

    renderComponent('123');

    await waitFor(() => {
      expect(screen.getByText('Test Recipe')).toBeInTheDocument();
    });

    // Click steps button
    const stepsButton = screen.getByRole('button', { name: /steps/i });
    act(() => {
      stepsButton.click();
    });

    await waitFor(() => {
      expect(screen.getByText('Step - 1')).toBeInTheDocument();
    });
  });

  it('renders loading skeleton when details are not loaded', async () => {
    // Mock fetch to never resolve
    fetch.mockImplementation(() => new Promise(() => {}));

    localStorageMock.getItem.mockImplementation((key) => {
      if (key === 'recentlyViewed') return null;
      if (key === 'allRecipesUser') return null;
      return null;
    });

    renderComponent('123');

    // Check that the recipe title is not rendered, meaning skeleton is shown
    expect(screen.queryByText('Test Recipe')).not.toBeInTheDocument();
  });
});