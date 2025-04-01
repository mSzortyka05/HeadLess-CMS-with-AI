import React, { useState, useEffect } from "react";
import { ApolloClient, InMemoryCache, ApolloProvider, useQuery, gql } from "@apollo/client";
import axios from "axios";
import { Card, CardContent, Button, Typography, CardMedia, AppBar, Toolbar, IconButton, Select, MenuItem } from "@mui/material";
import { motion } from "framer-motion";
import MenuIcon from '@mui/icons-material/Menu';
import ThreeDScene from "./components/ThreeDScene";

const client = new ApolloClient({
  uri: "http://headlesscms.local/graphql",
  cache: new InMemoryCache(),
});

const GET_POSTS = gql`
  query GetPosts {
    posts {
      nodes {
        id
        title
        excerpt
        content
        featuredImage {
          node {
            sourceUrl
          }
        }
        date
      }
    }
  }
`;

const getAIPostSummary = async (content) => {
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions", // Zmieniony endpoint
      {
        model: "gpt-3.5-turbo", // Użyj tego modelu lub innego dostępnego
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant."
          },
          {
            role: "user",
            content: `Podsumuj ten artykuł:\n\n${content}`
          }
        ],
        max_tokens: 100
      },
      {
        headers: {
          "Authorization": `Bearer `,
          "Content-Type": "application/json"
        }
      }
    );
    
    return response.data.choices[0].text.trim();
  } catch (error) {
    console.error("Błąd podczas pobierania podsumowania:", error);
    return "Nie udało się uzyskać podsumowania.";
  }
};

const PostsList = ({ sortOption }) => {
  const { loading, error, data } = useQuery(GET_POSTS);
  const [expandedPost, setExpandedPost] = useState(null);
  const [summaries, setSummaries] = useState({});

  useEffect(() => {
    const fetchSummaries = async () => {
      const newSummaries = {};
      for (let post of data.posts.nodes) {
        const summary = await getAIPostSummary(post.content);
        newSummaries[post.id] = summary;
      }
      setSummaries(newSummaries);
    };

    if (data) {
      fetchSummaries();
    }
  }, [data]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const sortedPosts = [...data.posts.nodes].sort((a, b) => {
    if (sortOption === "date") {
      return new Date(b.date) - new Date(a.date);
    } else if (sortOption === "title") {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 p-6">
      {sortedPosts.map((post) => (
        <motion.div
          key={post.id}
          whileHover={{ scale: 1.05, rotateY: 5 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card sx={{ maxWidth: 345, margin: "auto", boxShadow: 3, marginBottom: 4 }}>
            {post.featuredImage && (
              <CardMedia
                component="img"
                height="200"
                image={post.featuredImage.node.sourceUrl}
                alt={post.title}
              />
            )}
            <CardContent>
              <Typography variant="h6" component="div" gutterBottom>
                {post.title}
              </Typography>
              <motion.div
                initial={{ height: "50px", overflow: "hidden" }}
                animate={{ height: expandedPost === post.id ? "auto" : "50px" }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  dangerouslySetInnerHTML={{
                    __html: expandedPost === post.id ? post.content : post.excerpt,
                  }}
                />
                {expandedPost === post.id && summaries[post.id] && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    <strong>AI Summary:</strong> {summaries[post.id]}
                  </Typography>
                )}
              </motion.div>
              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
                onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
              >
                {expandedPost === post.id ? "Show Less" : "Read More"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

const App = () => {
  const [sortOption, setSortOption] = useState("date");

  return (
    <ApolloProvider client={client}>
      <div className="min-h-screen bg-gray-100 flex flex-col items-center">
        <AppBar position="sticky">
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              My Blog
            </Typography>
            <Select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              sx={{ color: 'white', backgroundColor: '#3f51b5', borderRadius: '4px' }}
            >
              <MenuItem value="date">Sort by Date</MenuItem>
              <MenuItem value="title">Sort by Title</MenuItem>
            </Select>
            <IconButton color="inherit">
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        <Typography variant="h4" component="h1" sx={{ my: 4 }}>
          Latest Posts
        </Typography>
        <PostsList sortOption={sortOption} />
      </div>
      <ThreeDScene />
    </ApolloProvider>
  );
};

export default App;
