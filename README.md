⏺ # Tend — Marketing Website                                                    
                                                            
  Marketing landing page for [Tend](https://tend.ai), an AI-powered SMS home    
  assistant platform for home warranty companies.
                                                                                
  Built with Next.js 14, TypeScript, and Tailwind CSS. Deployed on Vercel.

  ---                                                                           
   
  ## Getting Started                                                            
                                                            
  Install dependencies:

  ```bash
  npm install

  Run the development server:

  npm run dev

  Open http://localhost:3000 in your browser.                                   
   
  ---                                                                           
  Running Tests                                             

  npm test

  npm run test:coverage

  ---
  Deploying
           
  This project is configured for https://vercel.com. Connect the repository in
  the Vercel dashboard and it will deploy automatically on every push to main.  
  No additional configuration required.
                                                                                
  ---                                                       
  Project Structure

  ├── app/                  # Next.js App Router (layout, page, global styles)
  ├── components/           # Page sections (one file per section)              
  │   ├── Navigation.tsx
  │   ├── Hero.tsx                                                              
  │   ├── Stats.tsx                                         
  │   ├── HowItWorks.tsx                                                        
  │   ├── Features.tsx                                      
  │   ├── ForHomeowners.tsx
  │   ├── Pricing.tsx
  │   ├── FAQ.tsx
  │   ├── CTA.tsx                                                               
  │   └── Footer.tsx
  └── __tests__/            # Jest + React Testing Library (one file per        
  component)                                                                    
   
  ---                                                                           
  Placeholder Items                                         
                   
  The following are intentionally left as placeholders and should be updated
  before launch:                                                                
   
  ┌────────────────────────┬─────────────────────────────────────┐              
  │          Item          │              Location               │
  ├────────────────────────┼─────────────────────────────────────┤
  │ Logo                   │ Navigation.tsx, Footer.tsx          │
  ├────────────────────────┼─────────────────────────────────────┤
  │ Brand colors           │ tailwind.config.ts → brand.* values │              
  ├────────────────────────┼─────────────────────────────────────┤
  │ Contact / booking link │ CTA.tsx                             │              
  ├────────────────────────┼─────────────────────────────────────┤              
  │ Contact email          │ CTA.tsx, Footer.tsx                 │
  ├────────────────────────┼─────────────────────────────────────┤              
  │ Privacy Policy page    │ Footer.tsx                          │
  ├────────────────────────┼─────────────────────────────────────┤              
  │ Terms of Service page  │ Footer.tsx                          │
  └────────────────────────┴─────────────────────────────────────┘              
                                                            
  ---
  Tech Stack

  - https://nextjs.org — App Router
  - https://www.typescriptlang.org
  - https://tailwindcss.com                                                     
  - https://jestjs.io + https://testing-library.com
