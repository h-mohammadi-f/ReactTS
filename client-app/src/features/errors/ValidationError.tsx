import { Message } from "semantic-ui-react";

interface Prop {
  errors: any;
}
export default function ValidationError({ errors }: Prop) {
  console.log(errors);
  return (
    <Message error>
      {errors && (
        <Message.List>
          {errors.map((err: any, i: any) => (
            <Message.Item key={i} content={err} />
          ))}
        </Message.List>
      )}
    </Message>
  );
}
