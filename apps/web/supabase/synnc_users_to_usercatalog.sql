create or replace function public.sync_user_to_catalog()
returns trigger
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  full_name text := null;
  first_name_val text := null;
  last_name_val text := null;
  user_name_val text := null;
  user_mobile_val text := null;
  for_business_name_val text := null;
  for_business_number_val text := null;
  updated_count int;
begin
  -- Safely extract data from raw_user_meta_data, if it exists
  if new.raw_user_meta_data ? 'full_name' then
    full_name := new.raw_user_meta_data ->> 'full_name';
  end if;
  
  if new.raw_user_meta_data ? 'first_name' then
    first_name_val := new.raw_user_meta_data ->> 'first_name';
  end if;
  
  if new.raw_user_meta_data ? 'last_name' then
    last_name_val := new.raw_user_meta_data ->> 'last_name';
  end if;
  
  if new.raw_user_meta_data ? 'user_name' then
    user_name_val := new.raw_user_meta_data ->> 'user_name';
  end if;
  
  if new.raw_user_meta_data ? 'user_mobile' then
    user_mobile_val := new.raw_user_meta_data ->> 'user_mobile';
  end if;
  
  if new.raw_user_meta_data ? 'for_business_name' then
    for_business_name_val := new.raw_user_meta_data ->> 'for_business_name';
  end if;
  
  if new.raw_user_meta_data ? 'for_business_number' then
    for_business_number_val := new.raw_user_meta_data ->> 'for_business_number';
  end if;

  -- Try to update based on either user_id or user_email
  update public.user_catalog
  set
    user_id = new.id,
    user_email = new.email,
    user_mobile = coalesce(user_mobile_val, new.phone),
    first_name = coalesce(first_name_val, full_name),
    last_name = last_name_val,
    user_name = user_name_val,
    for_business_name = for_business_name_val,
    for_business_number = for_business_number_val,
    business_name = for_business_name_val,
    business_number = for_business_number_val,
    created_datetime = now()
  where user_id = new.id
     or user_email = new.email;

  get diagnostics updated_count = row_count;

  -- If no row was updated, insert new
  if updated_count = 0 then
    insert into public.user_catalog (
      user_id, 
      user_email, 
      user_mobile, 
      first_name, 
      last_name,
      user_name,
      for_business_name,
      for_business_number,
      business_name, 
      business_number, 
      created_datetime
    ) values (
      new.id, 
      new.email, 
      coalesce(user_mobile_val, new.phone), 
      coalesce(first_name_val, full_name),
      last_name_val,
      user_name_val,
      for_business_name_val,
      for_business_number_val,
      for_business_name_val,
      for_business_number_val,
      now()
    );
  end if;

  return new;

  -- insert into public.user_catalog (user_id, user_email, user_mobile, first_name, created_at, updated_at)
  -- values (new.id, new.email, new.phone, full_name, now(), now())
  -- on conflict (user_id)
  -- do update set
  --   user_email = excluded.user_email,
  --   user_mobile = excluded.user_mobile,
  --   first_name = excluded.first_name,
  --   updated_at = now();
  -- return new;
end;
$$;

drop trigger if exists trigger_sync_user_to_catalog on auth.users;

create trigger trigger_sync_user_to_catalog
-- after insert or update on auth.users
after insert on auth.users  -- ❗ Only INSERT, no UPDATE
for each row execute procedure public.sync_user_to_catalog();
