import { render, screen } from '@testing-library/react';
import { PricingForm } from './PricingForm';

describe('PricingForm', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('renders form fields correctly', () => {
    render(<PricingForm onSubmit={mockOnSubmit} isLoading={false} />);

    // Check if main form fields are rendered with translated text
    expect(screen.getByText(/Paese di Origine/)).toBeInTheDocument();
    expect(screen.getByText(/Paese di Destinazione/)).toBeInTheDocument();
    expect(screen.getByText(/Peso \(kg\)/)).toBeInTheDocument();
    expect(screen.getByText(/Volume \(m³\)/)).toBeInTheDocument();
    expect(screen.getByText(/Tipo di Trasporto/)).toBeInTheDocument();
  });

  it('shows loading state when isLoading is true', () => {
    render(<PricingForm onSubmit={mockOnSubmit} isLoading={true} />);
    
    const submitButton = screen.getByRole('button', { name: /Calcolando/ });
    expect(submitButton).toBeDisabled();
  });
}); 