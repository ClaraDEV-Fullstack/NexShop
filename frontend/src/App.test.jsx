import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

vi.mock('./api/api', () => ({
  categoriesAPI: {
    getFeatured: vi.fn().mockResolvedValue({ data: [] }),
  },
  productsAPI: {
    getFeatured: vi.fn().mockResolvedValue({ data: [] }),
    getNewArrivals: vi.fn().mockResolvedValue({ data: [] }),
    getBestsellers: vi.fn().mockResolvedValue({ data: [] }),
    getOnSale: vi.fn().mockResolvedValue({ data: [] }),
  },
  authAPI: {
    getProfile: vi.fn(),
  },
}));

test('renders the storefront', async () => {
  render(<App />);
  expect(screen.getAllByText(/NextShopSphere/i).length).toBeGreaterThan(0);
  await waitFor(() => {
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });
});
