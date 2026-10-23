create table tutors (id uuid primary key default gen_random_uuid(), name text not null, qualification text, subject text, class_range text, location text, fee text, phone text, bio text, created_at timestamptz default now());

create table batches (id uuid primary key default gen_random_uuid(), tutor_id uuid references tutors(id) on delete cascade, name text not null, class_range text, subject text, created_at timestamptz default now());

create table students (id uuid primary key default gen_random_uuid(), batch_id uuid references batches(id) on delete cascade, name text not null, parent_phone text, monthly_fee numeric default 0, fee_paid boolean default false, created_at timestamptz default now());

create table attendance (id uuid primary key default gen_random_uuid(), student_id uuid references students(id) on delete cascade, class_date date not null, present boolean default true, created_at timestamptz default now(), unique (student_id, class_date));

create table homework (id uuid primary key default gen_random_uuid(), batch_id uuid references batches(id) on delete cascade, title text not null, details text, due_date date, created_at timestamptz default now());

create table schedule (id uuid primary key default gen_random_uuid(), batch_id uuid references batches(id) on delete cascade, day text not null, class_time time not null, created_at timestamptz default now());

create table announcements (id uuid primary key default gen_random_uuid(), tutor_id uuid references tutors(id) on delete cascade, title text not null, message text, created_at timestamptz default now());

alter table tutors enable row level security;
create policy "Public can view tutors" on tutors for select using (true); 