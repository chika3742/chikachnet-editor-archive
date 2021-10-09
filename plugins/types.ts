import { EntityMetaSysProps } from "contentful-management/dist/typings/export-types"

export interface ApiResponse<T> {
  success: boolean
  message: string
  idTokenExpired: boolean
  data: T
}

export interface Article {
  title: string
  slug: string
  body: string
  postDate: string
  category: string
  categoryId: string
  status: Status,
  heroImage: AssetData,
  sys: EntityMetaSysProps
}

export interface FixedPage {
  title: string
}

export interface Category {
  id: string
  name: string
  slug: string
  sys: EntityMetaSysProps
}

export interface AssetData {
  url: string
  id: string
}

export enum ContentType {
  blogPost = "blogPost",
  fixedPage = "fixedPage"
}

export enum Status {
  published = "公開",
  updated = "変更済み",
  draft = "下書き"
}