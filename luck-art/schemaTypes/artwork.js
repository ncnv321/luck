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
    },
    {
      name: 'medium',
      title: 'Medium',
      type: 'string',
      options: {
        list: [
          {title: 'Traditional', value: 'traditional'},
          {title: 'Digital', value: 'digital'},
          {title: 'Mix', value: 'mix'}
        ]
      }
    },
    {
      name: 'characters',
      title: 'Characters',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        list: [
          {title: 'bnuuy', value: 'bnuuy'},
          {title: 'fanart', value: 'fanart'}
        ]
      }
    }
  ],
  preview: {
    select: {
      title: 'title',
      year: 'year',
      medium: 'medium',
      media: 'image'
    },
    prepare({title, year, medium, media}) {
      return {
        title,
        subtitle: `(${year}) - ${medium || 'Unspecified medium'}`,
        media
      }
    }
  }
}