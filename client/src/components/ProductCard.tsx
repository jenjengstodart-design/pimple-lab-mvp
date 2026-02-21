import { ExternalLink, ShoppingBag } from "lucide-react";
import type { Product } from "@shared/schema";

export function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group relative bg-white rounded-xl p-5 border border-border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
      <div className="absolute top-4 right-4 bg-primary/10 text-primary p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
        <ExternalLink className="w-4 h-4" />
      </div>
      
      <div className="mb-4">
        <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center mb-3">
          <ShoppingBag className="w-5 h-5 text-accent-foreground" />
        </div>
        <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          {product.category}
        </span>
        <h3 className="font-display font-bold text-lg leading-tight mt-1 text-foreground group-hover:text-primary transition-colors">
          {product.name}
        </h3>
      </div>
      
      <div className="mt-auto flex items-center justify-between pt-4 border-t border-dashed border-border">
        <span className="font-bold text-primary">{product.price}</span>
        <a 
          href={product.link} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs font-medium bg-secondary hover:bg-secondary/80 px-3 py-1.5 rounded-full transition-colors"
        >
          View at Superdrug
        </a>
      </div>
    </div>
  );
}
