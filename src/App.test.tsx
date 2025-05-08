import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import App from './App';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('URL Analyzer App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the application title', () => {
    render(<App />);
    expect(screen.getByText(/URL Content Analyzer/i)).toBeInTheDocument();
  });

  test('allows entering a URL', async () => {
    render(<App />);
    const input = screen.getByLabelText(/Enter URL/i);
    await userEvent.type(input, 'https://example.com');
    expect(input).toHaveValue('https://example.com');
  });

  test('displays error when API call fails', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('API Error'));

    render(<App />);
    const input = screen.getByLabelText(/Enter URL/i);
    const button = screen.getByRole('button', { name: /Analyze/i });

    await userEvent.type(input, 'https://example.com');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Failed to analyze URL/i)).toBeInTheDocument();
    });
  });

  test('adds analysis result to the table when successful', async () => {
    const mockResult = {
      data: {
        id: 123,
        url: 'https://example.com',
        summary: 'This is a test summary',
        timestamp: '2023-01-01T00:00:00.000Z',
      },
    };

    mockedAxios.post.mockResolvedValueOnce(mockResult);

    render(<App />);
    const input = screen.getByLabelText(/Enter URL/i);
    const button = screen.getByRole('button', { name: /Analyze/i });

    await userEvent.type(input, 'https://example.com');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('https://example.com')).toBeInTheDocument();
      expect(screen.getByText('This is a test summary')).toBeInTheDocument();
    });
  });

  test('filters results based on search term', async () => {
    const mockResults = [
      {
        id: 1,
        url: 'https://example.com',
        summary: 'Example summary',
        timestamp: '2023-01-01T00:00:00.000Z',
      },
      {
        id: 2,
        url: 'https://test.com',
        summary: 'Test summary',
        timestamp: '2023-01-02T00:00:00.000Z',
      },
    ];

    // Set up initial state with mock results
    jest
      .spyOn(React, 'useState')
      .mockImplementationOnce(() => [mockResults, jest.fn()]);

    render(<App />);
    const searchInput = screen.getByLabelText(/Search results/i);

    await userEvent.type(searchInput, 'test');

    await waitFor(() => {
      expect(screen.getByText('https://test.com')).toBeInTheDocument();
      expect(screen.queryByText('https://example.com')).not.toBeInTheDocument();
    });
  });
});
