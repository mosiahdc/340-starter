--#1 The Tony Stark insert SQL statement works.
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

--#2 The Tony Stark update SQL statement works.
UPDATE public.account
SET account_type = 'Admin'
WHERE account_id = 1;

--#3 The delete Tony Stark SQL statement works.
DELETE from public.account
WHERE account_id = 1;

--#4 Modify the "GM Hummer" record to read "a huge interior" rather than "small interiors" using a single query.
UPDATE public.inventory
SET inv_description = REPLACE(
        inv_description,
        'small interiors',
        'a huge interior'
    )
WHERE inv_id = 10;

--#5 Use an inner join
SELECT
	inventory.inv_make,
	inventory.inv_model,
	classification.classification_name
FROM
	inventory
INNER JOIN
	classification
ON
	inventory.classification_id = classification.classification_id
WHERE
	classification.classification_id = 2;

--#6 Update All Records
UPDATE inventory
SET
	inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
	inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');