<div class="subcategory">
    <span>{{ $subcategory->name }}</span>
    <span class="latestThread">
        {{ $subcategory->latestThread()->title }}
    </span>
    {{ $subcategory->threads()->count() }}
</div>