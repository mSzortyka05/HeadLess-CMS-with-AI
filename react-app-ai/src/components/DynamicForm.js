import React, { useState } from 'react';
import { Button, TextField, Typography, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';

const DynamicForm = () => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = { name, email, age };

    // Wysyłanie danych do backendu (np. Express.js API)
    const response = await fetch('https://your-backend-api.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      setStep(3); // Przejście do podziękowania
    } else {
      setStep(2); // Błąd
    }
    setLoading(false);
  };

  return (
    <div className="form-container">
      <Typography variant="h4" sx={{ mb: 2 }}>Rejestracja użytkownika</Typography>
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <TextField
            label="Imię"
            variant="outlined"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() => setStep(2)}
            sx={{ mb: 2 }}
          >
            Dalej
          </Button>
        </motion.div>
      )}

      {step === 2 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <TextField
            label="Wiek"
            variant="outlined"
            fullWidth
            value={age}
            onChange={(e) => setAge(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            sx={{ mb: 2 }}
          >
            Zarejestruj się
          </Button>
        </motion.div>
      )}

      {step === 3 && (
        <Typography variant="h6" sx={{ mt: 4 }}>
          Dziękujemy za rejestrację! Twoje dane zostały zapisane.
        </Typography>
      )}

      {loading && <CircularProgress />}
    </div>
  );
};

export default DynamicForm;
