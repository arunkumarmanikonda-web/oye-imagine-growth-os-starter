alter table public.marketplace_requests
  drop constraint if exists marketplace_requests_status_check;

alter table public.marketplace_requests
  add constraint marketplace_requests_status_check
  check (
    status in (
      'submitted',
      'reviewing',
      'proposed',
      'assigned',
      'closed',
      'rejected'
    )
  );