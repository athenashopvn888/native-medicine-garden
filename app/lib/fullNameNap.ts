/**
 * NMG01 exact full name + NAP. Name = the store's full name as used on its Google Business Profile.
 * Public GBP primary phone only. Map link = this store's own Google place ID.
 */
export const FULL_NAME_NAP = {
  "code": "NMG01",
  "fullName": "Native Medicine Garden Dispensary Weed Delivery",
  "street": "76 Gerrard St W",
  "city": "Toronto",
  "region": "ON",
  "postal": "M5G 1J5",
  "phoneDisplay": "(437) 374-4544",
  "phoneTel": "tel:+14373744544",
  "hours": "Open 24 hours, 7 days a week",
  "mapsUrl": "https://www.google.com/maps/place/?q=place_id:ChIJRdUu63c1K4gR1-gTDpuMQpU",
  "placeId": "ChIJRdUu63c1K4gR1-gTDpuMQpU",
  "neighbourhood": "Gerrard & Bay",
  "intersection": "Gerrard St W & Bay St",
  "transit": "College and Dundas subway stations connect to nearby TTC routes.",
  "visitPath": "/visit"
} as const;

export const FULL_NAME_NAP_ADDRESS = `${FULL_NAME_NAP.street}, ${FULL_NAME_NAP.city}, ${FULL_NAME_NAP.region} ${FULL_NAME_NAP.postal}`;
