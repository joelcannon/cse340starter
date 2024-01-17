-- Inserting data into the account table
INSERT INTO public.account (account_firstname, account_lastname, account_email, account_password)
VALUES ('Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n');

-- Updating the account table
UPDATE public.account 
SET account_type = 'Admin'
WHERE account_id = 1;

-- Deleting data from the account table
DELETE FROM public.account 
WHERE account_id = 1;

-- Replace data in the account table
UPDATE public.inventory 
SET inv_description = REPLACE(inv_description, 'the small interiors', 'a huge interior')
WHERE inv_id = 10;

-- Join the classification and inventory tables
SELECT inv_make, inv_model, classification_name
FROM public.inventory
INNER JOIN public.classification ON inventory.classification_id = classification.classification_id
WHERE classification_name = 'Sport';

-- Update the image and thumbnail columns
UPDATE public.inventory 
SET 
    inv_image = REPLACE(inv_image, 'images/', 'images/vehicles/'),
    inv_thumbnail = REPLACE(inv_thumbnail, 'images/', 'images/vehicles/');
