# LogisticsPricer - Sistema di Calcolo Prezzi Trasporto

Un'applicazione MERN stack completa per il calcolo dei costi di trasporto merci internazionale, con gestione di dazi, tariffe, rotte di trasporto e pricing.

![Screenshot dell'applicazione](docs/Screenshot_1.png)

## 🚀 Funzionalità Principali

### ✅ Moduli Completamente Integrati

#### 1. **Shipping Routes Management** ⭐ **COMPLETO**
- ✅ CRUD completo per rotte di trasporto
- ✅ Gestione paesi origine/destinazione
- ✅ Calcolo tempi di transito (base, dogana, congestione porto)
- ✅ Gestione costi (base, dogane, porto, aggiuntivi)
- ✅ Filtri avanzati e paginazione
- ✅ Form modali per creazione/modifica
- ✅ Dashboard statistiche rotte
- ✅ Gestione restrizioni e requisiti

#### 2. **Pricing Management** ⭐ **COMPLETO**
- ✅ **Gestione Richieste di Pricing**: CRUD completo per richieste di calcolo prezzi
- ✅ **Gestione Risposte di Pricing**: Visualizzazione risultati calcoli
- ✅ **Statistiche Avanzate**: Dashboard con metriche e grafici
- ✅ **Filtri Intelligenti**: Ricerca per città, prodotto, HS Code, stato, tipo trasporto
- ✅ **Paginazione**: Gestione grandi volumi di dati
- ✅ **Form Completo**: Creazione/modifica richieste con validazione
- ✅ **Calcolo Automatico**: Integrazione con algoritmo di pricing esistente

#### 3. **Tariff Management** ⭐ **COMPLETO**
- ✅ CRUD completo per tariffe internazionali
- ✅ Gestione paesi origine/destinazione
- ✅ Tariffe base e speciali (anti-dumping)
- ✅ Date di efficacia e scadenza
- ✅ Filtri e paginazione
- ✅ Form modali per creazione/modifica
- ✅ Validazione HS Code e tariffe

#### 4. **USA Duties Management** ⭐ **COMPLETO**
- ✅ CRUD completo per dazi USA
- ✅ Gestione Section 301, 232, 201
- ✅ Ricerca per HS Code e descrizione prodotto
- ✅ Statistiche e filtri avanzati
- ✅ Interfaccia React moderna
- ✅ Form modali per creazione/modifica

### 🔧 Funzionalità Tecniche

- **Backend API RESTful** con TypeScript
- **Frontend React** con Tailwind CSS
- **Database MongoDB** con Mongoose
- **Validazione Dati** completa
- **Gestione Errori** robusta
- **Loading States** e feedback utente
- **Responsive Design** per tutti i dispositivi
- **TypeScript Strict Mode** con exactOptionalPropertyTypes

## 📊 Moduli Implementati

### 1. Shipping Routes Management

#### Endpoint API Disponibili
- `GET /api/v1/shipping/routes` - Lista rotte con filtri e paginazione
- `GET /api/v1/shipping/routes/:id` - Dettaglio singola rotta
- `POST /api/v1/shipping/routes` - Crea nuova rotta
- `PUT /api/v1/shipping/routes/:id` - Modifica rotta
- `DELETE /api/v1/shipping/routes/:id` - Elimina rotta
- `GET /api/v1/shipping/routes/stats` - Statistiche rotte

#### Struttura Dati
```typescript
{
  routeId: string;
  originCountry: string;
  destinationCountry: string;
  transportType: 'road' | 'air' | 'sea' | 'rail' | 'multimodal';
  baseTransitTime: number; // giorni
  customsDelay: number; // giorni
  portCongestion: number; // giorni
  totalTransitTime: number; // calcolato automaticamente
  restrictions: string[];
  requirements: {
    documents: string[];
    specialHandling: string[];
    certifications: string[];
  };
  costs: {
    baseCost: number;
    customsFees: number;
    portFees: number;
    additionalFees: number;
  };
  totalCost: number; // calcolato automaticamente
  isActive: boolean;
  effectiveDate: Date;
  expiryDate?: Date;
  notes?: string;
  source: string;
}
```

### 2. Pricing Management

#### Endpoint API Disponibili
- `GET /api/v1/pricing/requests` - Lista richieste con filtri e paginazione
- `GET /api/v1/pricing/requests/:id` - Dettaglio singola richiesta
- `POST /api/v1/pricing/requests` - Crea nuova richiesta
- `PUT /api/v1/pricing/requests/:id` - Modifica richiesta
- `DELETE /api/v1/pricing/requests/:id` - Elimina richiesta
- `GET /api/v1/pricing/requests/stats` - Statistiche richieste
- `GET /api/v1/pricing/responses` - Lista risposte con filtri
- `GET /api/v1/pricing/responses/:id` - Dettaglio singola risposta
- `POST /api/v1/pricing/calculate` - Calcola prezzo trasporto

#### Struttura Dati PricingRequest
```typescript
{
  origin: { country: string; city: string; coordinates?: [number, number] };
  destination: { country: string; city: string; coordinates?: [number, number] };
  cargo: {
    weight: number; // kg
    volume: number; // m³
    dimensions: { length: number; width: number; height: number };
    hsCode: string;
    productDescription: string;
    value: number; // USD
    quantity: number;
  };
  transport: {
    type: 'road' | 'air' | 'sea' | 'rail' | 'multimodal';
    urgency: 'standard' | 'express' | 'urgent';
    specialRequirements: string[];
  };
  options: {
    insurance: boolean;
    customsClearance: boolean;
    doorToDoor: boolean;
    temperatureControlled: boolean;
  };
  status: 'pending' | 'calculated' | 'expired' | 'cancelled';
}
```

#### Struttura Dati PricingResponse
```typescript
{
  requestId: string;
  baseTransportCost: number;
  dutiesAndTariffs: {
    baseDuty: number;
    specialTariffs: number;
    totalDuties: number;
    appliedRates: Array<{ tariffId: string; rate: number; type: string; description: string }>;
  };
  additionalCosts: {
    customsClearance: number;
    documentation: number;
    insurance: number;
    handling: number;
    storage: number;
  };
  totalCost: number;
  breakdown: { transport: number; duties: number; fees: number; insurance: number; total: number };
  transitTime: { estimated: number; confidence: number; factors: string[] };
  validity: { from: Date; to: Date };
  notes: string[];
}
```

### 3. Tariff Management

#### Endpoint API Disponibili
- `GET /api/v1/tariffs` - Lista tariffe con filtri e paginazione
- `GET /api/v1/tariffs/:id` - Dettaglio singola tariffa
- `POST /api/v1/tariffs` - Crea nuova tariffa
- `PUT /api/v1/tariffs/:id` - Modifica tariffa
- `DELETE /api/v1/tariffs/:id` - Elimina tariffa
- `GET /api/v1/tariffs/stats` - Statistiche tariffe

#### Struttura Dati
```typescript
{
  originCountry: string;
  destinationCountry: string;
  hsCode: string; // formato: XXXX.XX.XX
  baseRate: number; // percentuale
  specialRate?: number; // percentuale per tariffe speciali
  effectiveDate: Date;
  expiryDate?: Date;
  source: 'WTO' | 'CUSTOMS_API' | 'MANUAL' | 'TRADE_AGREEMENT';
  isActive: boolean;
  notes?: string;
}
```

### 4. USA Duties Management

#### Endpoint API Disponibili
- `GET /api/v1/usa-duties` - Lista dazi con filtri
- `GET /api/v1/usa-duties/:id` - Dettaglio singolo dazio
- `POST /api/v1/usa-duties` - Crea nuovo dazio
- `PUT /api/v1/usa-duties/:id` - Modifica dazio
- `DELETE /api/v1/usa-duties/:id` - Elimina dazio

#### Struttura Dati
```typescript
{
  hsCode: string;
  productDescription: string;
  baseRate: number; // percentuale
  section301Rate?: number; // percentuale
  section232Rate?: number; // percentuale
  section201Rate?: number; // percentuale
  effectiveDate: Date;
  expiryDate?: Date;
  source: 'USTR' | 'DOC' | 'CBP' | 'MANUAL';
  isActive: boolean;
  notes?: string;
}
```

## 🛠️ Installazione e Setup

### Prerequisiti
- Node.js 18+
- MongoDB 6+
- npm o yarn

### 1. Clone Repository
```bash
git clone <repository-url>
cd logisticsPricer
```

### 2. Setup Backend
```bash
cd backend
npm install
npm run build
```

### 3. Setup Frontend
```bash
cd frontend
npm install
```

### 4. Configurazione Database
```bash
# Avvia MongoDB (se non già in esecuzione)
sudo systemctl start mongod

# Oppure usa Docker
docker run -d -p 27017:27017 --name mongodb mongo:6
```

### 5. Avvio Applicazione

#### Opzione 1: Script Automatici
```bash
# Avvia tutto (backend + frontend + MongoDB)
./start.sh

# Ferma tutto
./stop.sh

# Gestione MongoDB
./db.sh start
./db.sh stop
./db.sh status
```

#### Opzione 2: Manuale
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend  
cd frontend
npm run dev

# Terminal 3: MongoDB (se necessario)
mongod
```

## 🌐 Accesso Applicazione

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health
- **API Docs**: http://localhost:5000/api/v1

## 📁 Struttura Progetto

```
logisticsPricer/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── usaDutiesController.ts ✅
│   │   │   ├── tariffController.ts ✅
│   │   │   ├── pricingController.ts ✅
│   │   │   └── shippingController.ts ✅
│   │   ├── models/
│   │   │   ├── USDuty.ts ✅
│   │   │   ├── TariffRate.ts ✅
│   │   │   ├── PricingRequest.ts ✅
│   │   │   ├── PricingResponse.ts ✅
│   │   │   ├── ShippingRoute.ts ✅
│   │   │   └── DutyCalculation.ts ✅
│   │   ├── routes/
│   │   │   ├── usaDuties.ts ✅
│   │   │   ├── tariffs.ts ✅
│   │   │   ├── pricing.ts ✅
│   │   │   ├── shipping.ts ✅
│   │   │   ├── auth.ts
│   │   │   └── users.ts
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── config/
│   │   ├── types/
│   │   └── utils/
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboard.tsx ✅
│   │   │   │   ├── USDutiesManagement.tsx ✅
│   │   │   │   ├── TariffManagement.tsx ✅
│   │   │   │   ├── TariffForm.tsx ✅
│   │   │   │   ├── PricingManagement.tsx ✅
│   │   │   │   ├── PricingStats.tsx ✅
│   │   │   │   ├── ShippingRouteManagement.tsx ✅
│   │   │   │   ├── ShippingRouteStats.tsx ✅
│   │   │   │   └── Analytics.tsx ✅
│   │   │   └── business/
│   │   │       ├── PricingCalculator.tsx ✅
│   │   │       ├── PricingForm.tsx ✅
│   │   │       └── PricingResult.tsx ✅
│   │   ├── services/
│   │   │   ├── usaDutiesService.ts ✅
│   │   │   ├── tariffService.ts ✅
│   │   │   ├── pricingService.ts ✅
│   │   │   └── shippingService.ts ✅
│   │   ├── types/
│   │   │   └── pricing.ts ✅
│   │   └── App.tsx
│   └── package.json
├── docs/
├── scripts/
├── config/
├── start.sh
├── stop.sh
├── db.sh
└── README.md
```

## 🎯 Funzionalità Disponibili

### Dashboard Amministrativa
- **Gestione Rotte di Trasporto**: CRUD completo con filtri e statistiche
- **Gestione Tariffe Doganali**: CRUD completo con validazione
- **Gestione Dazi USA**: CRUD completo con filtri per section
- **Gestione Richieste di Pricing**: CRUD completo con dashboard statistiche
- **Analytics**: Dashboard con metriche e grafici

### Calcolo Prezzi
- **Form di Calcolo**: Interfaccia per inserimento dati spedizione
- **Calcolo Automatico**: Integrazione con algoritmi di pricing
- **Risultati Dettagliati**: Breakdown completo dei costi
- **Storico Richieste**: Gestione e visualizzazione richieste precedenti

## 🔄 Prossimi Moduli da Integrare

- [ ] **User Management & Authentication**
- [ ] **Document Management**
- [ ] **Reporting & Analytics Avanzati**
- [ ] **Notifiche & Email**
- [ ] **Import/Export Dati**
- [ ] **API per Integrazioni Esterne**

## 🐛 Troubleshooting

### Problemi Comuni

1. **MongoDB Connection Error**
   ```bash
   # Verifica stato MongoDB
   ./db.sh status
   
   # Riavvia MongoDB
   ./db.sh restart
   ```

2. **Port Already in Use**
   ```bash
   # Trova processo che usa la porta
   lsof -i :5000
   lsof -i :5173
   
   # Termina processo
   kill -9 <PID>
   ```

3. **Build Errors**
   ```bash
   # Pulisci e reinstalla
   cd backend && npm run clean && npm install
   cd frontend && rm -rf node_modules && npm install
   ```

4. **TypeScript Errors**
   ```bash
   # Verifica build TypeScript
   cd frontend && npm run build
   cd backend && npm run build
   ```

## 📝 Note di Sviluppo

- Tutti i moduli seguono lo stesso pattern di integrazione
- API RESTful con validazione completa
- Frontend con gestione stati, loading e errori
- Database con modelli Mongoose ottimizzati
- Interfaccia utente moderna e responsive
- TypeScript Strict Mode con exactOptionalPropertyTypes
- Gestione robusta delle date e tipi opzionali

## 🚀 Deploy

### Docker
```bash
# Build e avvio con Docker Compose
docker-compose up -d

# Stop
docker-compose down
```

### Kubernetes
```bash
# Deploy su cluster K8s
kubectl apply -f k8s/
```

## 🤝 Contributi

1. Fork del progetto
2. Crea branch feature (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri Pull Request

# License

This project is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License (CC-BY-NC-4.0) - see the [LICENSE](LICENSE) file for details.

This license allows you to:
- ✅ Use, modify, and distribute the software
- ❌ Use it for commercial purposes
- ✅ Attribute the original author

For commercial use, please contact the author