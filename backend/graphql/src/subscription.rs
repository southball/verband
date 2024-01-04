use async_graphql::{Context, Subscription};

use crate::{guard::UserAnyGuard, VerbandEvent};

pub struct SubscriptionRoot;

#[Subscription]
impl SubscriptionRoot {
    #[graphql(guard = "UserAnyGuard")]
    async fn updates(
        &self,
        ctx: &Context<'_>,
    ) -> async_graphql::Result<impl futures::stream::Stream<Item = VerbandEvent>> {
        let sender = ctx.data::<tokio::sync::broadcast::Sender<VerbandEvent>>()?;
        let mut rx = sender.subscribe();

        Ok(async_stream::stream! {
            loop {
                let event = rx.recv().await;
                if let Err(tokio::sync::broadcast::error::RecvError::Closed) = event {
                    break;
                }
                if let Ok(event) = event {
                    yield event;
                }
            }
        })
    }
}
