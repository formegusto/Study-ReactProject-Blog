import Post from '../../models/post.js';
import mongoose from "mongoose";
import Joi from 'joi';

const { ObjectId } = mongoose.Types;

export const checkObjectId = (ctx, next) => {
    const { id } = ctx.params;
    if(!ObjectId.isValid(id)) {
        ctx.status = 400;
        return;
    };
    return next();
};

/* 포스트 작성
 POST /api/posts
 { 
     title: '제목', 
     body: '내용',
     tags: ['태그1','태그2'],
 }
*/
export const write = async ctx => {
    const schema = Joi.object().keys( {
        title: Joi.string().required(), // required()가 있으면 필수 항목
        body: Joi.string().required(),
        tags: Joi.array()
            .items(Joi.string())
            .required(), // 문자열로 이루어진 배열
    });

    const result = schema.validate(ctx.request.body);
    if(result.error) {
        ctx.status = 400;
        ctx.body = result.error;
        return;
    };

    const { title, body, tags } = ctx.request.body;
    const post = new Post({
        title,
        body,
        tags,
    });
    try {
        await post.save();
        ctx.body = post;
    } catch(e) {
        ctx.throw(500, e);
    }
};

/* 포스트 목록 조회
 GET /api/posts
*/
export const list = async ctx => {
    // query는 문자열이기 때문에 숫자로 변환해 주어야 한다.
    // 값이 주어지지 않았다면 1을 기본으로 한다.
    const page = parseInt(ctx.query.page || '1', 10);

    if(page < 1) {
        ctx.status = 400;
        return;
    }

    try {
        const posts = await Post.find()
            .sort({ _id: -1 })
            .limit(10)
            .skip((page - 1) * 10)
            .lean()
            .exec();
        const postCount = await Post.countDocuments().exec();
        ctx.set('Last-Page', Math.ceil(postCount / 10));
        ctx.body = posts
            .map(post => ({
                ...post,
                body:
                    post.body.length < 200 ? post.body : `${post.body.slice(0, 200)}...`,
            }));
    } catch (e) {
        ctx.throw(500, e);
    }
};

/* 특정 포스트 조회
 GET /api/posts/:id
*/
export const read = async ctx => {
    const { id } = ctx.params;
    try {
        const post = await Post.findById(id).exec();
        if(!post) {
            ctx.status = 404;
            return;
        }
        ctx.body = post;
    } catch(e) {
        ctx.throw(500, e);
    }
};

/* 특정 포스트 제거
 DELETE /api/posts/:id
*/
export const remove = async ctx => {
    const { id } = ctx.params;
    try {
        await Post.findByIdAndRemove(id).exec();
        ctx.status = 204; // No Content (성공하기는 했지만 응답할 데이터는 없음)
    } catch(e) {
        ctx.throw(500,e);
    }
};

/* 포스트 수정(특정 필드 변경)
 PATCH /api/posts/:id
 { title, body }
*/
export const update = async ctx => {
    const { id } = ctx.params;
    // write에서 사용한 schema와 비슷한데, required()가 없다.
    const schema = Joi.object().keys({
        title: Joi.string(),
        body: Joi.string(),
        tags: Joi.array().items(Joi.string()),
    });

    const result = schema.validate(ctx.request.body);
    if(result.error) {
        ctx.status = 400;
        ctx.body = result.error;
        return;
    };

    try {
        const post = await Post.findByIdAndUpdate(id, ctx.request.body, {
            new: true, // 이 값을 설정하면 업데이트된 데이터를 반환한다.
            // false 일 때는 업데이트 되기전의 데이터를 반환한다.
        }).exec();
        if(!post) {
            ctx.status = 404;
            return;
        }
        ctx.body = post;
    } catch(e) {
        ctx.throw(500, e);
    }
};