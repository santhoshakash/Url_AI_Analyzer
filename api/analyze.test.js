const axios = require('axios');
const cheerio = require('cheerio');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const handler = require('./analyze');

// Mock dependencies
jest.mock('axios');
jest.mock('cheerio');
jest.mock('@google/generative-ai');

describe('URL Analyzer API', () => {
  let req, res;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    req = {
      method: 'POST',
      body: { url: 'https://example.com' }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn(),
      end: jest.fn()
    };

    // Mock cheerio
    const mockCheerio = {
      load: jest.fn().mockReturnValue({
        text: jest.fn().mockReturnValue('Mock Title'),
        attr: jest.fn().mockReturnValue('Mock Description'),
        each: jest.fn((callback) => {
          callback(0, { text: () => 'Mock paragraph text' });
        }),
        remove: jest.fn()
      })
    };
    cheerio.load = mockCheerio.load;

    // Mock Gemini AI
    const mockGenerateContent = jest.fn().mockResolvedValue({
      response: { text: () => 'Mock AI summary' }
    });

    const mockGetGenerativeModel = jest.fn().mockReturnValue({
      generateContent: mockGenerateContent
    });

    GoogleGenerativeAI.mockImplementation(() => ({
      getGenerativeModel: mockGetGenerativeModel
    }));

    // Mock axios
    axios.get.mockResolvedValue({
      data: '<html><body><p>Test content</p></body></html>'
    });
  });

  test('returns 405 for non-POST requests', async () => {
    req.method = 'GET';
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({ error: 'Method not allowed' });
  });

  test('returns 400 if URL is missing', async () => {
    req.body = {};
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'URL is required' });
  });

  test('handles OPTIONS request correctly', async () => {
    req.method = 'OPTIONS';
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.end).toHaveBeenCalled();
  });

  test('returns analysis result for valid URL', async () => {
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      url: 'https://example.com',
      summary: 'Mock AI summary',
      timestamp: expect.any(String)
    }));
  });

  test('handles API errors gracefully', async () => {
    axios.get.mockRejectedValueOnce(new Error('Network error'));
    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: 'Failed to analyze URL'
    }));
  });

  test('handles AI generation errors gracefully', async () => {
    const mockGenerateContent = jest.fn().mockRejectedValueOnce(new Error('AI error'));
    GoogleGenerativeAI.mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockReturnValue({
        generateContent: mockGenerateContent
      })
    }));

    await handler(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});