# Setup Guide for PropellerAds & Supabase Integration

## 1. Supabase Setup

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/login and create a new project
3. Wait for the project to be ready (2-3 minutes)

### Step 2: Get Supabase Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://svdkiqsaguhwnipaxkjn.supabase.co`)
   - **Anon public key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### Step 3: Create Database Tables

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the entire contents of `supabase-schema.sql`
3. Paste it into the SQL Editor and click **Run**
4. Verify tables were created in **Table Editor**

### Step 4: Update Environment Variables

Add these to your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## 2. PropellerAds Setup

### Step 1: Create PropellerAds Account

1. Go to [propellerads.com](https://propellerads.com)
2. Sign up as a **Publisher**
3. Complete account verification

### Step 2: Create Ad Zone

1. In PropellerAds dashboard, go to **Zones**
2. Click **Add Zone**
3. Select **Video** or **Display** ad type
4. Configure your zone settings:
   - **Name**: "Crypto Faucet Ad Zone"
   - **Website**: Your faucet domain
   - **Category**: Technology/Cryptocurrency
5. Save and copy the **Zone ID**

### Step 3: Get Publisher ID

1. In PropellerAds dashboard, go to **Account** → **Settings**
2. Copy your **Publisher ID** (usually a number)

### Step 4: Update Environment Variables

Add these to your `.env.local` file:

```env
NEXT_PUBLIC_PROPELLER_ZONE_ID=your_zone_id_here
NEXT_PUBLIC_PROPELLER_PUBLISHER_ID=your_publisher_id_here
```

## 3. Install Required Dependencies

Run this command to install Supabase client:

```bash
npm install @supabase/supabase-js
```

## 4. Final Environment Variables

Your complete `.env.local` should look like this:

```env
# Faucet Configuration (REQUIRED)
FAUCET_PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=your_alchemy_or_infura_url_here

# Faucet Settings (OPTIONAL)
ETH_AMOUNT=0.0005
COOLDOWN_HOURS=24

# Frontend Configuration (OPTIONAL)
NEXT_PUBLIC_ETH_AMOUNT=0.0005
NEXT_PUBLIC_COOLDOWN_HOURS=24
NEXT_PUBLIC_RPC_URL=your_public_rpc_url_here

# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# PropellerAds Configuration (REQUIRED)
NEXT_PUBLIC_PROPELLER_ZONE_ID=your_zone_id_here
NEXT_PUBLIC_PROPELLER_PUBLISHER_ID=your_publisher_id_here
```

## 5. Testing

### Test Supabase Connection

1. Start your development server: `npm run dev`
2. Open browser console and check for any Supabase connection errors
3. Try the faucet flow - it should create records in your Supabase tables

### Test PropellerAds Integration

1. The current implementation uses mock ads for development
2. Once you have real PropellerAds credentials, the component will load actual ads
3. Monitor the browser console for any PropellerAds loading errors

## 6. Production Deployment

### Vercel Environment Variables

When deploying to Vercel, add all environment variables in:
**Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**

### Security Notes

- Never commit `.env.local` to version control
- Use different Supabase projects for development and production
- Enable Row Level Security (RLS) policies in production
- Consider rate limiting at the CDN level for additional protection

## 7. Monitoring

### Supabase Dashboard

- Monitor database usage in **Settings** → **Usage**
- Check logs in **Logs** section
- Set up alerts for high usage

### PropellerAds Dashboard

- Monitor ad performance and earnings
- Check fill rates and click-through rates
- Optimize ad placements based on analytics

## Troubleshooting

### Common Issues

1. **Supabase connection errors**: Check URL and API key format
2. **PropellerAds not loading**: Verify zone ID and publisher ID
3. **CORS errors**: Ensure your domain is whitelisted in PropellerAds
4. **Database permission errors**: Check RLS policies in Supabase

### Support

- Supabase: [docs.supabase.com](https://docs.supabase.com)
- PropellerAds: Contact their support team through dashboard
