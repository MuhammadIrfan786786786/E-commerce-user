(() => {
  const forms = document.querySelectorAll('.store-search');
  if (!forms.length || typeof supabase === 'undefined') return;

  const productPromise = supabase
    .from('products')
    .select('id, name, description')
    .then(({ data }) => data || [])
    .catch(() => []);
  const categoryPromise = supabase
    .from('categories')
    .select('id, name, slug')
    .then(({ data }) => data || [])
    .catch(() => []);

  forms.forEach(form => {
    const input = form.querySelector('input[name="search"]');
    if (!input) return;

    const suggestions = document.createElement('div');
    suggestions.className = 'search-suggestions';
    suggestions.setAttribute('role', 'listbox');
    form.appendChild(suggestions);

    let activeIndex = -1;

    const closeSuggestions = () => {
      suggestions.classList.remove('is-open');
      suggestions.innerHTML = '';
      activeIndex = -1;
    };

    const showSuggestions = async () => {
      const term = input.value.trim().toLowerCase();
      if (term.length < 1) {
        closeSuggestions();
        return;
      }

      const categories = await categoryPromise;
      const matchingCategories = categories
        .filter(category => `${category.name || ''} ${category.slug || ''}`.toLowerCase().includes(term))
        .slice(0, 6);

      // A category match takes priority, so "ba" shows Bags instead of every bag product.
      if (matchingCategories.length) {
        suggestions.innerHTML = '';
        matchingCategories.forEach((category, index) => {
          const option = document.createElement('button');
          option.type = 'button';
          option.className = 'search-suggestion';
          option.setAttribute('role', 'option');
          option.dataset.index = index;

          const name = document.createElement('strong');
          name.textContent = category.name || 'Category';
          const hint = document.createElement('span');
          hint.textContent = 'Category';
          option.append(name, hint);

          option.addEventListener('click', () => {
            window.location.href = `product.html?category=${encodeURIComponent(category.id)}`;
          });
          suggestions.appendChild(option);
        });
        suggestions.classList.add('is-open');
        return;
      }

      const products = await productPromise;
      const matches = products
        .map(product => {
          const name = (product.name || '').toLowerCase();
          const description = (product.description || '').toLowerCase();
          const score = name.startsWith(term) ? 0 : name.includes(term) ? 1 : description.includes(term) ? 2 : 3;
          return { product, score };
        })
        .filter(result => result.score < 3)
        .sort((left, right) => left.score - right.score)
        .slice(0, 6)
        .map(result => result.product);

      suggestions.innerHTML = '';
      if (!matches.length) {
        const empty = document.createElement('div');
        empty.className = 'search-suggestion-empty';
        empty.textContent = 'No matching categories or products';
        suggestions.appendChild(empty);
        suggestions.classList.add('is-open');
        return;
      }

      matches.forEach((product, index) => {
        const option = document.createElement('button');
        option.type = 'button';
        option.className = 'search-suggestion';
        option.setAttribute('role', 'option');
        option.dataset.index = index;

        const name = document.createElement('strong');
        name.textContent = product.name || 'Product';
        const hint = document.createElement('span');
        hint.textContent = 'View product';
        option.append(name, hint);

        option.addEventListener('click', () => {
          input.value = product.name || '';
          form.submit();
        });
        suggestions.appendChild(option);
      });

      suggestions.classList.add('is-open');
    };

    input.addEventListener('input', showSuggestions);
    input.addEventListener('keydown', event => {
      const options = [...suggestions.querySelectorAll('.search-suggestion')];
      if (!suggestions.classList.contains('is-open') || !options.length) {
        if (event.key === 'Escape') closeSuggestions();
        return;
      }

      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        activeIndex = event.key === 'ArrowDown'
          ? (activeIndex + 1) % options.length
          : (activeIndex - 1 + options.length) % options.length;
        options.forEach((option, index) => option.classList.toggle('is-active', index === activeIndex));
      } else if (event.key === 'Enter' && activeIndex >= 0) {
        event.preventDefault();
        options[activeIndex].click();
      } else if (event.key === 'Escape') {
        closeSuggestions();
      }
    });

    form.addEventListener('submit', () => closeSuggestions());
    document.addEventListener('click', event => {
      if (!form.contains(event.target)) closeSuggestions();
    });
  });
})();
