import { getIdToken } from '@firebase/auth'
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import { auth } from '~/plugins/firebase'
import { ApiResponse, Article, Category, ContentType } from '~/plugins/types'

const axiosDefaultConfig = async () => ({
  headers: {
    authorization: "Bearer " + await getIdToken(auth.currentUser!)
  }
})

export async function getEntries(contentType: ContentType): Promise<Article[]> {
  const result = await get<Article[]>("entry/list", {
    params: {
      content_type: contentType
    }
  })
  return result!.data.data
}

export async function getSingleArticle(id: string): Promise<Article> {
  const result = await get<Article>("entry/single", {
    params: {
      content_type: ContentType.blogPost,
      id
    }
  })
  return result!.data.data
}

export async function getCategories(): Promise<Category[]> {
  const result = await get<Category[]>("category/list")
  return result!.data.data
}

async function get<T>(apiName: string, config: AxiosRequestConfig<never> = {}): Promise<AxiosResponse<ApiResponse<T>> | undefined> {
  let result: AxiosResponse<ApiResponse<T>> | undefined
  try {
    result = await axios.get<ApiResponse<T>>(`${process.env.apiBaseUrl}/${apiName}`, {
      ...config,
      ...await axiosDefaultConfig()
    })
  } catch (e: any) {
    const error = e as AxiosError<ApiResponse<any>>
    const response = error.response?.data as ApiResponse<any>
    if (response.idTokenExpired) {
      result = await get<T>(apiName, config)
    } else {
      console.error(response.message)
      throw response
    }
  }

  return result
}