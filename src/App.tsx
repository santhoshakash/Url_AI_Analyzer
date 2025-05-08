import React, { useState } from 'react';
import {
  Container,
  TextField,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import axios from 'axios';

interface AnalysisResult {
  id: number;
  url: string;
  summary: string;
  timestamp: string;
}

function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        '/api/analyze',
        { url },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      setResults([response.data, ...results]);
      setUrl('');
    } catch (error) {
      console.error('Error analyzing URL:', error);
      setError('Failed to analyze URL');
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = results.filter(
    (result) =>
      result.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.summary.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container maxWidth='lg' sx={{ py: 4 }}>
      <Typography variant='h4' component='h1' gutterBottom>
        URL Content Analyzer
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              label='Enter URL'
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder='https://example.com'
              required
            />
            <Button
              type='submit'
              variant='contained'
              disabled={loading}
              sx={{ minWidth: 120 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Analyze'}
            </Button>
          </Box>
        </form>
      </Paper>

      {error && (
        <Alert severity='error' sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        label='Search results'
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>URL</TableCell>
              <TableCell>Summary</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredResults.map((result) => (
              <TableRow key={result.id}>
                <TableCell>
                  <a
                    href={result.url}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    {result.url}
                  </a>
                </TableCell>
                <TableCell>{result.summary}</TableCell>
                <TableCell>
                  {new Date(result.timestamp).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default App;
