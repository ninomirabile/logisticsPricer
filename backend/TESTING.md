# Testing Guide - LogisticsPricer API

## Test con cURL

Questo documento descrive come testare l'API LogisticsPricer usando cURL.

### Avvio del Server di Test

```bash
# Compila il progetto
npm run build

# Avvia il server di test con database in memoria
npm run test:server
```

Il server di test si avvia su `http://localhost:3000` con un database MongoDB in memoria e dati di test pre-caricati.

### Test Manuali con cURL

#### 1. Verifica API Principale
```bash
curl -X GET http://localhost:3000/api/v1/
```

#### 2. Calcolo Prezzo di Trasporto
```bash
curl -X POST http://localhost:3000/api/v1/pricing/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "IT",
    "destination": "DE", 
    "weight": 100,
    "volume": 0.5,
    "transportType": "road"
  }'
```

#### 3. Ricerca Codici HS
```bash
curl -X GET "http://localhost:3000/api/v1/tariffs/hs-codes?query=smartphone"
```

#### 4. Calcolo Dazi
```bash
curl -X POST http://localhost:3000/api/v1/tariffs/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "originCountry": "CN",
    "destinationCountry": "US",
    "hsCode": "8517.13.00",
    "productValue": 1000,
    "transportType": "sea"
  }'
```

#### 5. Rotte di Spedizione
```bash
curl -X GET "http://localhost:3000/api/v1/shipping/routes?originCountry=CN&destinationCountry=US"
```

#### 6. Calcolo Tempo di Transito
```bash
curl -X POST http://localhost:3000/api/v1/shipping/calculate-transit \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "CN",
    "destination": "US",
    "transportType": "sea",
    "productType": "electronics",
    "urgency": "standard"
  }'
```

#### 7. Documenti Richiesti
```bash
curl -X GET "http://localhost:3000/api/v1/shipping/documents?originCountry=CN&destinationCountry=US&productType=electronics&transportType=sea&value=5000"
```

#### 8. Restrizioni di Spedizione
```bash
curl -X GET "http://localhost:3000/api/v1/shipping/restrictions?originCountry=CN&destinationCountry=US&productType=electronics&hsCode=8517.13.00"
```

#### 9. Validazione Rotta
```bash
curl -X POST http://localhost:3000/api/v1/shipping/validate-route \
  -H "Content-Type: application/json" \
  -d '{
    "originCountry": "CN",
    "destinationCountry": "US",
    "transportType": "sea",
    "productType": "electronics"
  }'
```

### Test Automatici

Esegui tutti i test automaticamente:

```bash
# Avvia il server di test in background
npm run test:server &

# Aspetta che il server sia pronto
sleep 5

# Esegui i test automatici
npm run test:curl
```

### Test di Validazione

Testa la gestione degli errori:

```bash
# Test con campi mancanti
curl -X POST http://localhost:3000/api/v1/pricing/calculate \
  -H "Content-Type: application/json" \
  -d '{"origin": "IT"}'
```

### Risultati Attesi

#### Calcolo Prezzo
- **Trasporto IT→DE**: ~€200 (trasporto su strada)
- **Trasporto CN→US**: ~€315 (trasporto marittimo + dazi)

#### Calcolo Dazi
- **Elettronica CN→US**: $250 (25% tariffa Section 301)
- **Altri prodotti**: Varia in base al codice HS

#### Tempi di Transito
- **CN→US mare**: 26 giorni (21 + 3 + 2)
- **CN→US aria**: 4 giorni (3 + 1 + 0)

### Dati di Test Pre-caricati

Il server di test include:

- **Tariffe**: Section 301 per elettronica cinese (25%)
- **Rotte**: CN→US (mare/aria), CN→EU (mare)
- **Codici HS**: Smartphone, laptop, vestiti, giocattoli
- **Restrizioni**: FCC, CE, FDA, certificazioni varie

### Troubleshooting

#### Server non risponde
```bash
# Verifica che il server sia in esecuzione
ps aux | grep test-server

# Riavvia il server
pkill -f test-server
npm run test:server
```

#### Errori di connessione MongoDB
```bash
# Pulisci e ricompila
npm run clean
npm run build
npm run test:server
```

#### Test falliscono
```bash
# Verifica che il server sia pronto
curl -X GET http://localhost:3000/api/v1/

# Controlla i log del server
# Il server dovrebbe mostrare "✅ Connected to in-memory MongoDB"
``` 