import { EntityMetaSysProps } from 'contentful-management/types'

export interface ApiResponse<T> {
  success: boolean
  message: string
  idTokenExpired: boolean
  data: T
}

export enum Status {
  published = "公開",
  updated = "変更済み",
  draft = "下書き"
}

export interface Article {
  title: string
  slug: string
  body: string
  postDate: string
  category: string
  categoryId: string
  status: Status
  sys: EntityMetaSysProps
}

export interface Category {
  name: string
  slug: string
  sys: EntityMetaSysProps
}

export enum ContentType {
  blogPost = "blogPost",
  fixedPage = "fixedPage"
}