// import { Body, Controller, Delete, Get, Params, Patch, Post, Put } from '@sodacore/http';
// import { PrismaClient } from '../../prisma/prisma/client';
// import { Inject } from '@sodacore/di';

// @Controller('/api/todo')
// export default class TodoApiController {
// 	@Inject('prisma') private prisma!: PrismaClient;

// 	@Get('/')
// 	public async list() {
// 		return this.prisma.todos.findMany();
// 	}

// 	@Post('/')
// 	public async create(@Body() body: { title: string, description?: string }) {
// 		return this.prisma.todos.create({
// 			data: {
// 				title: body.title,
// 				description: body.description,
// 			},
// 		});
// 	}

// 	@Get('/:id')
// 	public async get(@Params('id') id: number) {
// 		return await this.prisma.todos.findUnique({
// 			where: { id },
// 		});
// 	}

// 	@Put('/:id')
// 	public async replace(@Params('id') id: number, @Body() body: { title: string, description?: string }) {
// 		const todo = await this.prisma.todos.update({
// 			where: { id },
// 			data: {
// 				title: body.title,
// 				description: body.description,
// 			},
// 		});
// 		if (!todo) {
// 			throw new Error('Todo not found');
// 		}
// 		return todo;
// 	}

// 	@Patch('/:id')
// 	public async update(@Params('id') id: number, @Body() body: { title?: string, description?: string, completed?: boolean }) {
// 		const todo = await this.prisma.todos.update({
// 			where: { id },
// 			data: {
// 				title: body.title,
// 				description: body.description,
// 				completed: body.completed,
// 			},
// 		});
// 		return todo;
// 	}

// 	@Delete('/:id')
// 	public async delete(@Params('id') id: number) {
// 		const todo = await this.prisma.todos.delete({
// 			where: { id },
// 		});
// 		return todo;
// 	}
// }
