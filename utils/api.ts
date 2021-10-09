import { getIdToken } from '@firebase/auth'
import { base64Encode } from '@firebase/util'
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, Method } from 'axios'
import { auth } from '~/plugins/firebase'
import { ApiResponse, Article, AssetData, Category, ContentType, FixedPage } from '~/plugins/types'

const axiosDefaultHeader = async () => ({
  authorization: "Bearer " + await getIdToken(auth.currentUser!)
})

export async function getEntries(contentType: ContentType): Promise<Article[]> {
  const result = await req<Article[]>("GET", "entry/list", {
    params: {
      content_type: contentType
    }
  })
  return result!.data.data
}

export async function getSingleArticle(id: string): Promise<Article> {
  const result = await req<Article>("GET", "entry/single", {
    params: {
      content_type: ContentType.blogPost,
      id
    }
  })
  return result!.data.data
}

export async function updateSingleArticle(id: string, data: Article): Promise<ApiResponse<never>> {
  const result = await req<Article>("POST", "entry/single", {
    data,
    params: {
      content_type: ContentType.blogPost,
      id
    }
  })
  return result!.data as ApiResponse<never>
}

export async function getCategories(): Promise<Category[]> {
  const result = await req<Category[]>("GET", "category/list")
  return result!.data.data
}

export async function uploadAsset(file: File): Promise<AssetData> {
  const data = await new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => {
      resolve(reader.result)
    }
    reader.readAsArrayBuffer(file)
  })
  const result = await req<AssetData>("POST", "asset/create", {
    params: {
      file_name: file.name,
      content_type: file.type,
    },
    headers: {
      "Content-Type": file.type
    },
    onUploadProgress(event) {
      console.log(event.loaded)
      
    },
    data
  })
  return await result?.data.data!
  
}

async function req<T>(method: string, apiName: string, config: AxiosRequestConfig<any> = {}): Promise<AxiosResponse<ApiResponse<T>> | undefined> {
  let result: AxiosResponse<ApiResponse<T>> | undefined
  try {
    result = await axios.request<ApiResponse<T>>({
      url: `${process.env.apiBaseUrl}/${apiName}`,
      method: method as Method,
      ...config,
      headers: {
        ...config.headers,
        ...await axiosDefaultHeader()
      }
    })
  } catch (e: any) {
    const error = e as AxiosError<ApiResponse<any>>
    const response = error.response?.data as ApiResponse<any>
    if (response.idTokenExpired) {
      result = await req<T>(method, apiName, config)
    } else {
      console.error(response.message)
      throw e
    }
  }

  return result
}