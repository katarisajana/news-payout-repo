import React, { useState, useEffect, useCallback } from "react";
import { fetchNews } from "../services/NewsService";
import {
  Container,
  Typography,
  Box,
  TextField,
  Card,
  CardContent,
  Button,
  Grid2,
} from "@mui/material";
import debounce from "lodash/debounce"; // For debouncing
import { saveAs } from "file-saver"; // For file downloading
import Papa from "papaparse"; // For CSV export
import jsPDF from "jspdf"; // For PDF export
import "jspdf-autotable"; // For table support in PDF
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useNavigate } from "react-router-dom"; // For navigation

const Dashboard = () => {
  const [articles, setArticles] = useState([]); // All fetched articles
  const [filteredArticles, setFilteredArticles] = useState([]); // Articles after applying author filter
  const [loading, setLoading] = useState(false);

  const [query, setQuery] = useState("tesla");
  const [from, setFrom] = useState(""); // Start date
  const [to, setTo] = useState(""); // End date
  const [authorFilter, setAuthorFilter] = useState(""); // Local filter for author
  const [payoutRate, setPayoutRate] = useState(
    localStorage.getItem("payoutRate") || 5
  ); 
  const [chartType, setChartType] = useState("line"); // For switching chart types

  const today = new Date().toISOString().split("T")[0]; // Today's date in YYYY-MM-DD format

  const navigate = useNavigate();

  // Debounced function for fetching articles
  const debouncedFetch = useCallback(
    debounce((query, from, to) => {
      fetchFilteredNews(query, from, to);
    }, 500),
    []
  );

  // Fetch articles when query, from, or to changes
  useEffect(() => {
    debouncedFetch(query, from, to);
  }, [query, from, to, debouncedFetch]);

  // Apply author filter locally
  useEffect(() => {
    if (authorFilter) {
      const filtered = articles.filter((article) =>
        article.author?.toLowerCase().includes(authorFilter.toLowerCase())
      );
      setFilteredArticles(filtered);
    } else {
      setFilteredArticles(articles); 
    }
  }, [authorFilter, articles]);

  const fetchFilteredNews = async (query, from, to) => {
    setLoading(true);
    const fetchedArticles = await fetchNews({ query, from, to });
    setArticles(fetchedArticles); 
    setFilteredArticles(fetchedArticles); 
    setLoading(false);
  };

  const handlePayoutRateChange = (e) => {
    const newPayoutRate = e.target.value;
    setPayoutRate(newPayoutRate);
    localStorage.setItem("payoutRate", newPayoutRate); // Save to localStorage
  };

  const totalPayout = filteredArticles.length * parseFloat(payoutRate);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  // Export to CSV
  const exportToCSV = () => {
    const csvData = filteredArticles.map((article) => ({
      Title: article.title,
      Author: article.author || "Unknown",
      Date: new Date(article.publishedAt).toLocaleDateString(),
      Description: article.description || "No description available",
      Payout: payoutRate,
    }));
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "news-payout-report.csv");
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("News Payout Report", 14, 10);
    const tableData = filteredArticles.map((article) => [
      article.title,
      article.author || "Unknown",
      new Date(article.publishedAt).toLocaleDateString(),
      // article.description || "No description available",
      payoutRate,
    ]);
    doc.autoTable({
      head: [["Title", "Author", "Date", "Payout"]],
      body: tableData,
    });
    doc.save("news-payout-report.pdf");
  };

  // Group articles by author or type
  const groupBy = (key) => {
    return filteredArticles.reduce((acc, article) => {
      const value = article[key] || "Unknown";
      if (!acc[value]) {
        acc[value] = { count: 0 };
      }
      acc[value].count += 1;
      return acc;
    }, {});
  };

  // Prepare data for charts
  const articleDataByAuthor = Object.keys(groupBy("author")).map((author) => ({
    name: author,
    count: groupBy("author")[author].count,
  }));

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" align="center" gutterBottom>
        News Dashboard
      </Typography>
      

      {/* Logout Button */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button variant="outlined" color="secondary" onClick={handleLogout}>
          Logout
        </Button>
      </Box>

      {/* Filters */}
      <Box sx={{ mb: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
        <Grid2 sx={{columnGap:'5px', rowGap:'5px', display:'flex'}}>
        <TextField
          label="Search"
          variant="outlined"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          
        />
        <TextField
          label="Filter by Author"
          variant="outlined"
          value={authorFilter}
          onChange={(e) => setAuthorFilter(e.target.value)}
         
        />
        </Grid2>
        <TextField
          label="From"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          InputProps={{
            inputProps: {
              max: to ? to : today, // Ensure "from" is never later than "to"
            },
          }}
        />
        <TextField
          label="To"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={to}
          onChange={(e) => setTo(e.target.value)}
          InputProps={{
            inputProps: {
              min: from ? from : "", // Ensure "to" is never earlier than "from"
              max: today, // Prevent selecting future dates
            },
          }}
        />
        {/* Fetch News Button */}
      <Button variant="contained" onClick={() => fetchFilteredNews(query, from, to)}>
        Fetch News
      </Button>

      </Box>

      {/* Payout Rate */}
      <Box sx={{ mb: 3, display:'flex', gap:'5px'}}>
        <TextField
          label="Payout per Article in ($)"
          variant="outlined"
          value={payoutRate}
          onChange={handlePayoutRateChange}
          type="number"
        />
        <Typography variant="h6" align="center">
          Total Payout: ${totalPayout.toFixed(2)}
        </Typography>
      </Box>


      {/* Export Buttons */}
      <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
        <Button variant="outlined" onClick={exportToCSV}>
          Export as CSV
        </Button>
        <Button variant="outlined" onClick={exportToPDF}>
          Export as PDF
        </Button>
      </Box>

      {/* News Analytics - Charts */}
      <Box sx={{ mt: 5 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Article Trends
        </Typography>

        {/* Chart Type Selector */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <Button onClick={() => setChartType("line")}>Line Chart</Button>
          <Button onClick={() => setChartType("bar")}>Bar Chart</Button>
          <Button onClick={() => setChartType("pie")}>Pie Chart</Button>
        </Box>

        {/* Render the selected chart type */}
        <ResponsiveContainer width="100%" height={400}>
          {chartType === "line" && (
            <LineChart data={articleDataByAuthor}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#8884d8" />
            </LineChart>
          )}
          {chartType === "bar" && (
            <BarChart data={articleDataByAuthor}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          )}
          {chartType === "pie" && (
            <PieChart>
              <Pie
                data={articleDataByAuthor}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={150}
                fill="#8884d8"
                label
              >
                {articleDataByAuthor.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index % 2 === 0 ? "#8884d8" : "#82ca9d"}
                  />
                ))}
              </Pie>
            </PieChart>
          )}
        </ResponsiveContainer>
      </Box>

      {/* Articles */}
      {loading ? (
        <Typography align="center">Loading articles...</Typography>
      ) : (
        <Box
          sx={{
            mt: 3,
            display: "grid",
            gap: 2,
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          }}
        >
          {filteredArticles.map((article, index) => (
            <Card key={index}>
              <CardContent>
                <Typography variant="h6">{article.title}</Typography>
                <Typography variant="body2">{article.author || "Unknown"}</Typography>
                <Typography variant="body2">
                  {new Date(article.publishedAt).toLocaleDateString()}
                </Typography>
                <Typography>{
                  article.description || "No description available"
                }</Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Container>
  );
};

export default Dashboard;
