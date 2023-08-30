import { AxiosResponse } from "axios";
import { useEffect, useState } from "react";
import { FormikValues, useFormik } from "formik";
import { ObjectSchema, AnyObject } from "yup";

import {
  apiErrorParser,
  commonSuccessRespFilter,
} from "../helpers/responseHelpers";
import axiosHttp from "../utils/axiosHttp";
import { PaginatedResponse, SuccessDataResponse } from "../types/responses";

export function usePagination<DataType>(
  serviceAction: (
    page: number,
    limit: number
  ) => Promise<AxiosResponse<PaginatedResponse<DataType[]>>>,
  page: number,
  limit: number
) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [data, setData] = useState<DataType[]>([]);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError(false);

    serviceAction(page, limit)
      .then(({ data: resData }) => {
        setData((prev) => [...new Set<DataType>([...prev, ...resData.data])]);
        setHasMore(Boolean(resData.next));
        setLoading(false);
      })
      .catch((e) => setError(true));
  }, [page, limit, serviceAction]);

  return { loading, error, data, hasMore };
}

interface UsePostProps<
  TReturnType,
  TData extends FormikValues,
  T extends ObjectSchema<AnyObject> = any
> {
  url: string;
  initialValues: TData;
  schema?: T;
  type?: "post" | "patch";
  notify?: boolean;
  onComplete?: (data: TReturnType) => any;
}

export function usePost<
  TReturnType,
  TData extends FormikValues,
  TShape extends ObjectSchema<AnyObject>
>(options: UsePostProps<TReturnType, TData, TShape>) {
  const [error, setError] = useState<string>();
  const [data, setData] = useState<TReturnType>();
  const [message, setMessage] = useState<string>();

  // const { notify } = useProvideNotification();

  const formik = useFormik<TData>({
    initialValues: options.initialValues,
    validationSchema: options.schema,
    onSubmit: (values, { setSubmitting, resetForm }) => {
      axiosHttp[options.type || "post"]<SuccessDataResponse<TReturnType>>(
        options.url,
        values
      )
        .then(commonSuccessRespFilter)
        .then(({ data: resData }) => {
          setData(resData.data);
          setMessage(resData.message);
          setSubmitting(false);
          resetForm();
          if (options.onComplete) options.onComplete(resData.data);
          // if (options.notify) notify(resData.message);
        })
        .catch(apiErrorParser)
        .catch((e: Error) => {
          setError(e.message);
          // notify(e);
          setSubmitting(false);
        });
    },
  });

  return {
    message,
    data,
    error,
    formik,
  };
}
