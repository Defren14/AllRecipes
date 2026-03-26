

/*
import { describe, test, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom/vitest';
//kobra's code 

import { render, screen } from '@testing-library/react';
import RecentlyViewed from '../pages/RecentlyViewed';

describe('RecentlyViewed Component', () => {
  
  beforeEach(() => {
    localStorage.clear();
  });

  test('shows title', () => {
    render(
        <MemoryRouter>
        <RecentlyViewed />
      </MemoryRouter>
    );


   //expect(screen.getByText(/Recently Viewed Recipes/i)).toBeInTheDocument();
expect(
      screen.getByRole('heading', { name: /Recently Viewed Recipes/i })).toBeInTheDocument();
  });

  test('shows empty message when no recipes', () => {
    render(
        <MemoryRouter>
        <RecentlyViewed />
      </MemoryRouter>
    );

    expect(
      screen.getAllByText(/No recently viewed recipes yet/i)[0]
    ).toBeInTheDocument();
  });

  test('renders recipes from localStorage', () => {
    const mockRecipes = [
      {
        id: 1,
        title: 'Test Recipe',
        image: 'test.jpg',
      },
    ];

    localStorage.setItem('recentRecipes', JSON.stringify(mockRecipes));

    render(
        <MemoryRouter>
        <RecentlyViewed />
      </MemoryRouter>
    );

    expect(screen.getByText('Test Recipe')).toBeInTheDocument();
  });

});
*/




import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom/vitest';
import { render, screen, cleanup } from '@testing-library/react';
import RecentlyViewed from '../pages/RecentlyViewed';

describe('RecentlyViewed Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  test('shows title', () => {
    render(
      <MemoryRouter>
        <RecentlyViewed />
      </MemoryRouter>
    );

    expect(
      screen.getByRole('heading', { name: /Recently Viewed Recipes/i })
    ).toBeInTheDocument();
  });

  test('shows empty message when no recipes', () => {
    render(
      <MemoryRouter>
        <RecentlyViewed />
      </MemoryRouter>
    );

    expect(
      screen.getAllByText(/No recently viewed recipes yet/i)[0]
    ).toBeInTheDocument();
  });

  test('renders recipes from localStorage', () => {
    const mockRecipes = [
      {
        id: 1,
        title: 'Test Recipe',
        image: 'test.jpg',
      },
    ];

    localStorage.setItem('recentRecipes', JSON.stringify(mockRecipes));

    render(
      <MemoryRouter>
        <RecentlyViewed />
      </MemoryRouter>
    );

    expect(screen.getByText('Test Recipe')).toBeInTheDocument();
  });

  test('shows View Recipe link', () => {
    const mockRecipes = [
      {
        id: 1,
        title: 'Test Recipe',
        image: 'test.jpg',
      },
    ];

    localStorage.setItem('recentRecipes', JSON.stringify(mockRecipes));

    render(
      <MemoryRouter>
        <RecentlyViewed />
      </MemoryRouter>
    );

    expect(screen.getByText(/View Recipe/i)).toBeInTheDocument();
  });

  test('shows recipe image', () => {
    const mockRecipes = [
      {
        id: 1,
        title: 'Test Recipe',
        image: 'test.jpg',
      },
    ];

    localStorage.setItem('recentRecipes', JSON.stringify(mockRecipes));

    render(
      <MemoryRouter>
        <RecentlyViewed />
      </MemoryRouter>
    );

    const image = screen.getByAltText('Test Recipe');
    expect(image).toBeInTheDocument();
  });

  test('renders multiple recipes', () => {
    const mockRecipes = [
      {
        id: 1,
        title: 'Recipe One',
        image: 'one.jpg',
      },
      {
        id: 2,
        title: 'Recipe Two',
        image: 'two.jpg',
      },
    ];

    localStorage.setItem('recentRecipes', JSON.stringify(mockRecipes));

    render(
      <MemoryRouter>
        <RecentlyViewed />
      </MemoryRouter>
    );

    expect(screen.getByText('Recipe One')).toBeInTheDocument();
    expect(screen.getByText('Recipe Two')).toBeInTheDocument();
  });

  test('does not show empty message when recipes exist', () => {
    const mockRecipes = [
      {
        id: 1,
        title: 'Test Recipe',
        image: 'test.jpg',
      },
    ];

    localStorage.setItem('recentRecipes', JSON.stringify(mockRecipes));

    render(
      <MemoryRouter>
        <RecentlyViewed />
      </MemoryRouter>
    );

    expect(
      screen.queryByText(/No recently viewed recipes yet/i)
    ).not.toBeInTheDocument();
  });

  test('renders correct recipe link href', () => {
    const mockRecipes = [
      {
        id: 5,
        title: 'Pasta',
        image: 'pasta.jpg',
      },
    ];

    localStorage.setItem('recentRecipes', JSON.stringify(mockRecipes));

    render(
      <MemoryRouter>
        <RecentlyViewed />
      </MemoryRouter>
    );

    const link = screen.getByRole('link', { name: /View Recipe/i });
    expect(link).toHaveAttribute('href', '/recipe/5');
  });

  test('shows recipe title from localStorage', () => {
    const mockRecipes = [
      {
        id: 7,
        title: 'Chicken Soup',
        image: 'soup.jpg',
      },
    ];

    localStorage.setItem('recentRecipes', JSON.stringify(mockRecipes));

    render(
      <MemoryRouter>
        <RecentlyViewed />
      </MemoryRouter>
    );

    expect(screen.getByText('Chicken Soup')).toBeInTheDocument();
  });

  test('shows all recipe images for multiple recipes', () => {
    const mockRecipes = [
      {
        id: 1,
        title: 'Recipe One',
        image: 'one.jpg',
      },
      {
        id: 2,
        title: 'Recipe Two',
        image: 'two.jpg',
      },
    ];

    localStorage.setItem('recentRecipes', JSON.stringify(mockRecipes));

    render(
      <MemoryRouter>
        <RecentlyViewed />
      </MemoryRouter>
    );

    expect(screen.getByAltText('Recipe One')).toBeInTheDocument();
    expect(screen.getByAltText('Recipe Two')).toBeInTheDocument();
  });
});
