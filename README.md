# Photo Gallery + Wedding RSVP

Photography portfolio built with Vite + React + TypeScript + Ant Design + Framer Motion, with integrated Wedding RSVP feature using Supabase.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

#### Mock Mode (Default - for development)

```env
VITE_USE_MOCK_DATA=true
```

No Supabase credentials needed. Uses in-memory mock data with sample guests.

#### Production Mode (with Supabase)

```env
VITE_USE_MOCK_DATA=false
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Get these values from your Supabase project: **Settings → API**

### 3. Supabase Database Setup

Create these tables in your Supabase project:

#### `weddings`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| slug | text | URL slug (e.g., "anna-joan") |
| title | text | Wedding title |
| event_date | date | Date of the wedding |
| closing_date | date | RSVP deadline |

#### `guests`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| wedding_id | uuid | FK to weddings |
| name | text | Guest name |
| email | text | Guest email |
| invite_code | text | Unique invite code |
| max_companions | integer | Max companions allowed |

#### `guest_confirmations`
| Column | Type | Description |
|--------|------|-------------|
| guest_id | uuid | FK to guests (unique) |
| attending | boolean | Will attend? |
| companions_count | integer | Number of companions |
| notes | text | Special notes |

#### `guest_companions`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| guest_confirmation_id | uuid | FK to guest_confirmations |
| name | text | Companion name |

### 4. Run development server

```bash
npm run dev
```

## Testing the Wedding RSVP

With mock mode enabled, use these invite codes:

| Guest | Invite Code | Max Companions |
|-------|-------------|---------------|
| Maria Garcia | `MARIA2025` | 2 |
| Pere López | `PERE2025` | 1 |
| Laia Puig | `LAIA2025` | 3 |

Navigate to: `http://localhost:5173/#/weddings/anna-joan`

## Build

```bash
npm run build
```

Output is in the `dist` folder.

## Security Note

Configure Row Level Security (RLS) policies in Supabase to restrict:
- Guests can only read their own record
- Guests can only upsert their own confirmation
