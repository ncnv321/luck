// schemas/artwork.js
export default {
  name: 'artwork',
  title: 'Artwork',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Name of the artwork'
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96
      }
    },
    {
      name: 'year',
      title: 'Year',
      type: 'number',
      description: 'Year the artwork was created'
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'Description or caption for the artwork'
    },
    {
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true // Enables UI for selecting focal point of the image
      }
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          {title: '2025', value: '2025'},
          {title: '2024', value: '2024'},
          {title: '2023', value: '2023'},
          {title: '2022', value: '2022'},
          {title: 'Sketches & Scraps', value: 'sketches'}
        ]
      }
    }
  ],
  preview: {
    select: {
      title: 'title',
      year: 'year',
      media: 'image'
    },
    prepare({title, year, media}) {
      return {
        title,
        subtitle: `(${year})`,
        media
      }
    }
  }
}