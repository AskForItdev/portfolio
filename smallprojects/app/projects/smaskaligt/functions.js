export default function flattenCreatorData(data) {
  const flatData = data.map((c) => ({
    id: c.user_id,
    displayName: c.company_name,
    firstName: c.first_name,
    lastName: c.last_name,
    city: c.city,
    mainCategory: c.smsk_creator_categories.map(
      (x) => x.smsk_categories.name
    ),
    styles: c.smsk_creator_styles.map((s) => s.style_id),
    materials: c.smsk_creator_materials.map(
      (m) => m.material_id
    ),
    features: c.smsk_creator_features.map(
      (f) => f.smsk_features.name
    ),
    imageUrls: c.smsk_creator_images.map((i) => i.img_url),
  }));
  return flatData;
}
