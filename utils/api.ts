import { getIdToken } from '@firebase/auth'
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, Method } from 'axios'
import { auth } from '~/plugins/firebase'
import { ApiResponse, Article, ArticleResponse, AssetData, Category, CommentResponse, ContentType, FixedPage } from '~/plugins/types'

const axiosDefaultHeader = async () => ({
  authorization: "Bearer " + await getIdToken(auth.currentUser!)
})

export async function getEntries(contentType: ContentType, skip: number): Promise<ArticleResponse> {
  const result = await req<ArticleResponse>("GET", "entry/list", {
    params: {
      content_type: contentType,
      skip
    }
  })
  return result!.data.data
}

export async function getSingleEntry<T>(id: string, contentType: ContentType): Promise<T> {
  const result = await req<T>("GET", "entry/single", {
    params: {
      content_type: contentType,
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

export async function publishUpdatedEntries(): Promise<void> {
  await req<void>("POST", "entry/publish/updated")
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

export async function updateSingleEntry<T>(id: string, data: Article | FixedPage, contentType: ContentType): Promise<ApiResponse<T>> {
  const result = await req<T>("POST", "entry/single", {
    data,
    params: {
      content_type: contentType,
      id
    }
  })
  return result!.data as ApiResponse<T>
}

export async function getCategories(): Promise<Category[]> {
  const result = await req<Category[]>("GET", "category/list")
  return result!.data.data
}

export async function getAssets(): Promise<AssetData[]> {
  const result = await req<AssetData[]>("GET", "asset/list", {})
  return result!.data.data
}

export async function uploadAsset(file: File, onProgress: (msg: string) => void): Promise<AssetData> {
  onProgress("???????????????...")
  const data = await new Promise<ArrayBuffer>((resolve) => {
    const reader = new FileReader()
    reader.onload = () => {
      resolve(reader.result as ArrayBuffer)
    }
    reader.readAsArrayBuffer(file)
  })
  onProgress("?????????????????????...")
  const result1 = await req<never>("PUT", "asset/single", {
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
  onProgress("?????????...")
  await req<never>("POST", "asset/process", {
    params: {
      id
    }
  })
  onProgress("?????????????????????...")
  const result = await req<AssetData>("POST", "asset/publish", {
    params: {
      id
    }
  })
  return await result?.data.data!
}

export async function deleteAsset(id: string) {
  await req<null>("DELETE", "/asset/single", {
    params: {
      id
    }
  })
}

export async function getPreviewToken(): Promise<string> {
  const result = await req<string>("GET", "preview_token")
  return result?.data.data!
}

export async function getComments(offset: number): Promise<CommentResponse> {
  const result = await req<CommentResponse>("GET", "comment/list", {
    params: {
      offset
    }
  })
  return result?.data.data!
}

export async function editComment(id: string, content: string): Promise<void> {
  await req<void>("POST", "comment/content-edit", {
    params: {
      id
    },
    data: {
      content
    }
  })
}

export async function deleteComment(id: string): Promise<void> {
  await req<void>("DELETE", "comment/single", {
    params: {
      id
    }
  })
}

export async function addAdminNotificationToken(token: string) {
  await req<void>("POST", "notification-token", {
    data: {
      token
    }
  })
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
    if (e.response) {
      const error = e as AxiosError<ApiResponse<any>>
      const response = error.response?.data as ApiResponse<any>
      if (response.idTokenExpired) {
        result = await req<T>(method, apiName, config)
      } else {
        console.error(response.message)
        throw e
      }
    } else throw e
  }

  return result
}
