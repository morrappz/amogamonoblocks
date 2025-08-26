create or replace function check_user_existence(user_email text, user_phone text)
returns text
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
    found_email text;
    found_phone text;
begin
    select u.email, u.phone
    into found_email, found_phone
    from auth.users u
    where u.email = user_email or u.phone = user_phone;

    if found_email is not null then
        return found_email;
    elsif found_phone is not null then
        return found_phone;
    else
        return 'USER_DOES_NOT_EXIST';
    end if;
end;
$$;