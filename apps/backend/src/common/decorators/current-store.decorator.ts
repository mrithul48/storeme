// apps/api/src/common/decorators/current-store.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentStore = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const store = request.store;
    return data && store ? store[data] : store;
  },
);

