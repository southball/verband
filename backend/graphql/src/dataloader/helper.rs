#[macro_export]
macro_rules! generate_dataloader_single {
    ($key_ty: ty, $value_ty: ty, $fn: expr) => {
        #[async_trait::async_trait]
        impl async_graphql::dataloader::Loader<$key_ty> for crate::VerbandLoader {
            type Value = $value_ty;
            type Error = async_graphql::Error;

            async fn load(
                &self,
                ids: &[$key_ty],
            ) -> async_graphql::Result<std::collections::HashMap<$key_ty, $value_ty>> {
                let mut conn = self.0.acquire().await?;
                let entities = $fn(&mut conn, &ids).await?;
                let mut result = std::collections::HashMap::new();
                for entity in entities {
                    result.insert(entity.id, entity);
                }
                Ok(result)
            }
        }
    };
}

#[macro_export]
macro_rules! generate_dataloader_multiple {
    ($key_ty: path, $value_ty: ty, $key: ident, $fn: expr) => {
        #[async_trait::async_trait]
        impl async_graphql::dataloader::Loader<$key_ty> for crate::VerbandLoader {
            type Value = Vec<$value_ty>;
            type Error = async_graphql::Error;

            async fn load(
                &self,
                ids: &[$key_ty],
            ) -> async_graphql::Result<std::collections::HashMap<$key_ty, Vec<$value_ty>>> {
                let ids = ids.into_iter().map(|id| id.0).collect::<Vec<_>>();
                let mut conn = self.0.acquire().await?;
                let entities = $fn(&mut conn, &ids).await?;
                let mut result: std::collections::HashMap<$key_ty, Vec<$value_ty>> =
                    std::collections::HashMap::new();
                for entity in entities {
                    result
                        .entry($key_ty(entity.$key))
                        .or_insert_with(Vec::new)
                        .push(entity);
                }
                for id in ids {
                    result.entry($key_ty(id)).or_insert_with(Vec::new);
                }
                Ok(result)
            }
        }
    };
}

#[macro_export]
macro_rules! generate_dataloader_multiple_to_multiple {
    ($key_ty: path, $value_ty: ty, $fn: expr) => {
        #[async_trait::async_trait]
        impl async_graphql::dataloader::Loader<$key_ty> for crate::VerbandLoader {
            type Value = Vec<$value_ty>;
            type Error = async_graphql::Error;

            async fn load(
                &self,
                ids: &[$key_ty],
            ) -> async_graphql::Result<std::collections::HashMap<$key_ty, Vec<$value_ty>>> {
                let ids = ids.into_iter().map(|id| id.0).collect::<Vec<_>>();
                let mut conn = self.0.acquire().await?;
                let mut result: std::collections::HashMap<$key_ty, Vec<$value_ty>> =
                    $fn(&mut conn, &ids)
                        .await?
                        .into_iter()
                        .map(|(k, v)| ($key_ty(k), v))
                        .collect();
                for id in ids {
                    result.entry($key_ty(id)).or_insert_with(Vec::new);
                }
                Ok(result)
            }
        }
    };
}
