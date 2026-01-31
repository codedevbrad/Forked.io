## Error Type
Runtime Error

## Error Message
A <Select.Item /> must have a value prop that is not an empty string. This is because the Select value can be set to an empty string to clear the selection and show the placeholder.


    at SelectItem (src/components/ui/select.tsx:109:5)
    at ProductForm (src/domains/products/_components/product-form.tsx:234:15)
    at ProductModal (src/domains/products/_components/product-modal.tsx:79:11)
    at ProductsList (src/domains/products/_components/products-list.tsx:70:11)
    at ProductsPage (src/app/(site)/system/products/page.tsx:9:7)

## Code Frame
  107 | }: React.ComponentProps<typeof SelectPrimitive.Item>) {
  108 |   return (
> 109 |     <SelectPrimitive.Item
      |     ^
  110 |       data-slot="select-item"
  111 |       className={cn(
  112 |         "focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",

Next.js version: 16.1.1 (Turbopack)
