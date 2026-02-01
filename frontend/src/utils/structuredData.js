/**
 * Generate JSON-LD structured data for a listing
 * @param {Object} listing - Animal listing object
 * @returns {string} JSON-LD script content
 */
export const generateListingStructuredData = (listing) => {
    const structuredData = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": listing.title || listing.breed,
        "description": listing.description || `${listing.animal_type} - ${listing.breed}`,
        "image": listing.images?.[0]?.image_url || "",
        "offers": {
            "@type": "Offer",
            "url": `https://kurbanlink.com/animals/${listing.id}`,
            "priceCurrency": "TRY",
            "price": listing.price,
            "availability": listing.is_active ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "seller": {
                "@type": "Person",
                "name": listing.seller_username || "KurbanLink Satıcı"
            }
        },
        "category": listing.animal_type,
        "brand": {
            "@type": "Brand",
            "name": "KurbanLink"
        }
    };

    return JSON.stringify(structuredData);
};

/**
 * Generate JSON-LD for organization/website
 */
export const generateOrganizationStructuredData = () => {
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "KurbanLink",
        "url": "https://kurbanlink.com",
        "logo": "https://kurbanlink.com/logo.png",
        "description": "Kurban hayvanı alım satım platformu",
        "sameAs": [
            // Add social media links here when available
        ]
    };

    return JSON.stringify(structuredData);
};
