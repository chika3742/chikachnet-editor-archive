import { getIdToken } from '@firebase/auth'
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

export async function createEntry(contentType: ContentType): Promise<{id: string}> {
  const result = await req<any>("PUT", "entry/single", {
    params: {
      content_type: contentType
    }
  })
  return result?.data.data!
}

export async function publishEntry(id: string): Promise<Article> {
  const result = await req<Article>("POST", "entry/publish", {
    params: {
      id
    }
  })
  return result?.data.data!
}

export async function unpublishEntry(id: string): Promise<Article> {
  const result = await req<Article>("POST", "entry/unpublish", {
    params: {
      id
    }
  })
  return result?.data.data!
}

export async function deleteEntry(id: string) {
  await req<never>("DELETE", "entry/single", {
    params: {
      id
    }
  })
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

export async function uploadAsset(file: File, onProgress: (msg: string) => void): Promise<AssetData> {
  onProgress("読み込み中...")
  const data = await new Promise<ArrayBuffer>((resolve) => {
    const reader = new FileReader()
    reader.onload = () => {
      resolve(reader.result as ArrayBuffer)
    }
    reader.readAsArrayBuffer(file)
  })
  onProgress("アップロード中...")
  const result1 = await req<never>("PUT", "asset/create", {
    params: {
      file_name: file.name,
      content_type: file.type,
    },
    headers: {
      "Content-Type": file.type
    },
    data: new Uint8Array(data)
  })
  const id = (result1?.data.data! as AssetData).id
  onProgress("処理中...")
  await req<never>("POST", "asset/process", {
    params: {
      id
    }
  })
  onProgress("パブリッシュ中...")
  const result = await req<AssetData>("POST", "asset/publish", {
    params: {
      id
    }
  })
  return await result?.data.data!
}

export async function getPreviewToken(): Promise<string> {
  const result = await req<string>("GET", "preview_token")
  return result?.data.data!
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