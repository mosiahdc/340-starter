-- The Tony Stark insert SQL statement works.
INSERT INTO public.account (
        account_firstname,
        account_lastname,
        account_email,
        account_password
    )
VALUES (
        'Tony',
        'Stark',
        'tony@starkent.com',
        'Iam1ronM@n'
    );

-- The Tony Stark update SQL statement works.
UPDATE public.account
SET account_type = 'Admin'
WHERE account_id = 1;

-- The delete Tony Stark SQL statement works.
DELETE from public.account
WHERE account_id = 1;

-- Modify the "GM Hummer" record to read "a huge interior" rather than "small interiors" using a single query.
UPDATE public.inventory
SET inv_description = REPLACE(
        inv_description,
        'small interiors',
        'a huge interior'
    )
WHERE inv_id = 10;