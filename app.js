const express = require('express');
const bodyParser = require('body-parser');
const { Client } = require('@elastic/elasticsearch');

const app = express();
const port = 3000;

// Create Elasticsearch client
const client = new Client({ node: 'http://localhost:5500' });

app.use(bodyParser.json());


// Index sample data function
async function indexSampleData() {
  try {
    // Create index if not exists
    await client.indices.create({
      index: 'blogposts',
      body: {
        mappings: {
          properties: {
            title: { type: 'text' },
            content: { type: 'text' }
          }
        }
      }
    });

    // Sample blog post data
    const blogPosts = [
      { id: 1, title: 'Introduction to Elasticsearch', content: 'Elasticsearch is a distributed, RESTful search and analytics engine.' },
      { id: 2, title: 'Getting Started with Node.js', content: 'Node.js is a JavaScript runtime built on Chrome\'s V8 JavaScript engine.' },
      { id: 3, title: 'RESTful API Design Best Practices', content: 'Learn about best practices for designing RESTful APIs.' },
    ];

    // Index sample blog post data
    const body = blogPosts.flatMap(doc => [{ index: { _index: 'blogposts' } }, doc]);
    const { body: bulkResponse } = await client.bulk({ refresh: true, body });

    if (bulkResponse.errors) {
      console.error('Failed to index sample data:', bulkResponse.errors);
    } else {
      console.log('Sample data indexed successfully!');
    }
  } catch (error) {
    console.error('Error indexing sample data:', error);
  }
}

// Search endpoint
app.get('/search', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const { body } = await client.search({
      index: 'blogposts',
      body: {
        query: {
          match: {
            content: q
          }
        },
        from: (page - 1) * size,
        size: size
      }
    });

    res.json(body.hits.hits);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
app.listen(port, async () => {
  console.log(`Server is listening on port ${port}`);
  // Index sample data before starting the server
  await indexSampleData();

  // Test the search functionality
  console.log('Testing search functionality...');
  const searchQuery = 'Node.js'; // Change this to your desired search query
  try {
    const { body } = await client.search({
      index: 'blogposts',
      body: {
        query: {
          match: {
            content: searchQuery
          }
        }
      }
    });
// CRUD operations for managing blog posts
app.post('/blogposts', async (req, res) => {
  try {
    const { title, content } = req.body;

    const { body } = await client.index({
      index: 'blogposts',
      body: {
        title,
        content
      }
    });

    res.json(body);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/blogposts/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { body } = await client.get({
      index: 'blogposts',
      id
    });

    res.json(body);
  } catch (error) {
    console.error(error);
    if (error.statusCode === 404) {
      res.status(404).json({ error: 'Blog post not found' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

app.put('/blogposts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    const { body } = await client.update({
      index: 'blogposts',
      id,
      body: {
        doc: { title, content }
      }
    });

    res.json(body);
  } catch (error) {
    console.error(error);
    if (error.statusCode === 404) {
      res.status(404).json({ error: 'Blog post not found' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

app.delete('/blogposts/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { body } = await client.delete({
      index: 'blogposts',
      id
    });

    res.json(body);
  } catch (error) {
    console.error(error);
    if (error.statusCode === 404) {
      res.status(404).json({ error: 'Blog post not found' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Start the server
app.listen(port, async () => {
  console.log(`Server is listening on port ${port}`);
  await indexSampleData();
});
    console.log('Search results:', body.hits.hits);
  } catch (error) {
    console.error('Error testing search functionality:', error);
  }
});