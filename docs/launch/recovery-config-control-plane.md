# Recovery Config Control Plane

## Purpose
Provide a temporary but production-oriented recovery surface for:
- provider credential intake
- secret rotation planning
- runtime resolution
- sync planning for Vercel, Supabase and backend runtime adapters

## Principles
- never write secrets into code
- store secret metadata centrally
- encrypt secret material server-side
- sync only to approved runtime targets
- support future rotation from one place

## Current surface
- /recovery/config
- /api/health
- /api/recovery/config/providers
- /api/recovery/config/bootstrap

## Next step
Wire persistence and real target sync adapters.