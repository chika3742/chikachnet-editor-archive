import { EntityMetaSysProps } from "contentful-management/dist/typings/export-types"

export interface ApiResponse<T> {
  success: boolean
  message: string
  idTokenExpired: boolean
  data: T
}

export interface ArticleResponse {
  total: number
  skip: number
  list: Article[]
}

export interface Article {
  title: string
  slug: string
  body: string
  postDate: string
  category: string
  categoryId: string
  description: string
  status: Status
  heroImage: AssetData | undefined,
  sys: EntityMetaSysProps
}

export interface FixedPage {
  title: string
  slug: string
  body: string
  status: Status
  description: string
  heroImage: AssetData | undefined,
  sys: EntityMetaSysProps
  postDate: string
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

export interface CommentResponse {
  offset: number
  list: Comment[]
}

export interface Comment {
  id: string
  ip: string
  uid: string
  nickname: string
  postDate: Date | undefined
  content: string
  entry: {
    id: string,
    title: string,
    url: string
  },
  replies: Comment[] | undefined
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