import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import RecentlyViewed from './RecentlyViewed';
import { BrowserRouter } from 'react-router-dom';

// npx vitest --coverage

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

// Mock fetch
global.fetch = vi.fn();

describe('RecentlyViewed Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders loading state initially', () => {
    vi.stubEnv('VITE_RECIPE_API_KEY', 'test-key');
    localStorageMock.getItem.mockReturnValue('123456,789012');
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 123456, title: 'Test Recipe' }),
    });

    render(
      <BrowserRouter>
        <RecentlyViewed />
      </BrowserRouter>
    );

    expect(screen.getAllByText('Loading...')).toHaveLength(4);
  });

  test('renders error when no API key', async () => {
    vi.stubEnv('VITE_RECIPE_API_KEY', undefined);
    localStorageMock.getItem.mockReturnValue('123456');

    render(
      <BrowserRouter>
        <RecentlyViewed />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No API key found. Cannot fetch recipe details.')).toBeInTheDocument();
    });
  });

  test('renders empty state when no recently viewed recipes', async () => {
    localStorageMock.getItem.mockReturnValue(null);

    render(
      <BrowserRouter>
        <RecentlyViewed />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("You haven't viewed any recipes yet.")).toBeInTheDocument();
    });
  });

  test('renders recipes when data is fetched successfully', async () => {
    vi.stubEnv('VITE_RECIPE_API_KEY', 'test-key');
    localStorageMock.getItem.mockReturnValue('123456');
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 123456, title: 'Test Recipe' }),
    });

    render(
      <BrowserRouter>
        <RecentlyViewed />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Recipe')).toBeInTheDocument();
    });
  });

  test('handles fetch failure gracefully', async () => {
    vi.stubEnv('VITE_RECIPE_API_KEY', 'test-key');
    localStorageMock.getItem.mockReturnValue('123456');
    fetch.mockResolvedValueOnce({
      ok: false,
    });

    render(
      <BrowserRouter>
        <RecentlyViewed />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("You haven't viewed any recipes yet.")).toBeInTheDocument();
    });
  });

  test('parses recently viewed IDs correctly', () => {
    localStorageMock.getItem.mockReturnValue('123456,789012,123456');

    act(() => {
      render(
        <BrowserRouter>
          <RecentlyViewed />
        </BrowserRouter>
      );
    });

    // Check if stats are displayed
    expect(screen.getByText('IDs stored:')).toBeInTheDocument();
    expect(screen.getByText('First ID:')).toBeInTheDocument();
  });
});