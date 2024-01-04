use sqlx::PgPool;

pub struct VerbandLoader(pub PgPool);

mod helper;

use crate::{
    generate_dataloader_multiple, generate_dataloader_multiple_to_multiple,
    generate_dataloader_single,
    model::{Block, BlockVersion, Post, Tag, User},
    scalar::{
        BlockId, BlockVersionId, BlockVersionsByBlockId, BlocksByPostId, PostId, PostsByCreatorId,
        TagId, TagsByPostId, UserId,
    },
};

generate_dataloader_single!(UserId, User, User::find_by_ids);
generate_dataloader_single!(PostId, Post, Post::find_by_ids);
generate_dataloader_single!(BlockId, Block, Block::find_by_ids);
generate_dataloader_single!(BlockVersionId, BlockVersion, BlockVersion::find_by_ids);
generate_dataloader_single!(TagId, Tag, Tag::find_by_ids);

generate_dataloader_multiple!(BlocksByPostId, Block, post_id, Block::find_by_post_ids);
generate_dataloader_multiple!(
    BlockVersionsByBlockId,
    BlockVersion,
    block_id,
    BlockVersion::find_by_block_ids
);
generate_dataloader_multiple!(
    PostsByCreatorId,
    Post,
    creator_id,
    Post::find_by_creator_ids
);

generate_dataloader_multiple_to_multiple!(TagsByPostId, Tag, Tag::find_for_post_ids);
