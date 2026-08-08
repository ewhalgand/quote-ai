import { Button as ButtonPrimitive } from '@base-ui/react/button';

function Button({ ...props }: ButtonPrimitive.Props) {
  return <ButtonPrimitive data-slot="button" {...props} />;
}

export { Button };
