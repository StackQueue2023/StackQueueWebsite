import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import {
  Rocket,
  Search,
  ExternalLink,
  Code2
} from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'EdTech Platform', 'Developer Tool', 'Collaboration', 'Analytics Dashboard', 'DevOps Platform'];

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const params = {};
        if (search) params.search = search;
        if (selectedCategory !== 'All') params.category = selectedCategory;

        const res = await api.get('/portal/products', { params });
        if (res.data.success) {
          setProducts(res.data.data.products || []);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [search, selectedCategory]);

  return (
    <div className="space-y-10 py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-white min-h-screen">
      {/* Banner */}
      <div className="bg-white rounded-3xl p-8 md:p-12 text-[#111827] border border-[#E5E7EB] shadow-xs space-y-4">
        <span className="inline-flex items-center space-x-1.5 px-3.5 py-1 bg-pink-50 border border-pink-200 rounded-full text-xs font-bold uppercase tracking-wider text-[#E02B91] shadow-2xs">
          <Rocket className="w-3.5 h-3.5 text-[#E02B91]" />
          <span>Real-World Software Engineering</span>
        </span>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-[#111827]">
          Our Technology Products
        </h1>
        <p className="text-[#4B5563] max-w-2xl text-sm md:text-base leading-relaxed font-medium">
          Explore software applications, developer sandboxes, and enterprise cloud tools designed and engineered by STACK QUEUE technology teams and internship fellows.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search products by name, tech stack, or purpose..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E02B91] font-medium text-[#111827]"
            />
          </div>

          <div className="text-xs font-bold text-[#4B5563]">
            Showing <strong className="text-[#E02B91]">{products.length}</strong> software products
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#E5E7EB]">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-[#E02B91] to-[#8B2BE2] text-white shadow-xs'
                  : 'bg-slate-100 text-[#4B5563] hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-10 h-10 border-4 border-[#E02B91] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-12 text-center space-y-3">
          <Rocket className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-[#111827]">No products found</h3>
          <p className="text-xs text-[#6B7280]">Try choosing a different product category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((prod, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-xs hover:shadow-md hover:border-pink-300 transition flex flex-col justify-between space-y-4 hover:-translate-y-1 duration-200 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#E02B91] bg-pink-50 px-2.5 py-1 rounded-full border border-pink-200">
                    {prod.category}
                  </span>
                  <span className="p-2 bg-pink-50 text-[#E02B91] rounded-xl group-hover:bg-pink-100 transition">
                    <Code2 className="w-4 h-4" />
                  </span>
                </div>

                <h3 className="text-xl font-black text-[#111827] group-hover:text-[#E02B91] transition">
                  {prod.name}
                </h3>

                <p className="text-xs text-[#4B5563] leading-relaxed">
                  {prod.shortDescription}
                </p>

                <div className="p-3 bg-slate-50 rounded-xl border border-[#E5E7EB] text-xs">
                  <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">
                    Technologies Used:
                  </span>
                  <span className="font-mono text-[#111827] text-xs font-semibold">
                    {prod.technology}
                  </span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(prod.tags || []).map((t, tIdx) => (
                    <span
                      key={tIdx}
                      className="px-2 py-0.5 bg-pink-50 text-[#E02B91] border border-pink-200 text-[10px] font-bold rounded-full"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-between">
                <Link
                  to={prod.demoUrl && prod.demoUrl.startsWith('/') ? prod.demoUrl : '/contact'}
                  className="px-4 py-2 bg-gradient-to-r from-[#E02B91] to-[#8B2BE2] hover:opacity-95 text-white font-bold text-xs rounded-full shadow-xs transition flex items-center space-x-1.5"
                >
                  <span>View Product</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>

                <Link
                  to="/contact"
                  className="text-xs font-semibold text-[#6B7280] hover:text-[#111827]"
                >
                  Request Demo
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
