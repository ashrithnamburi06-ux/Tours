// admin/js/admin-modules.js — modular list & form UI
(function () {
  'use strict';

  var MODULES = {
    packages: {
      endpoint: '/packages',
      mockKey: 'packages',
      title: 'Packages',
      listPage: 'packages.html',
      formPage: 'packages-form.html',
      statusPatch: false, // packages: PUT status (no /status route)
      columns: [
        { key: 'image', label: 'Image', type: 'image', field: 'images' },
        { key: 'title', label: 'Title', field: 'title' },
        { key: 'destination', label: 'Destination', fn: function (r) {
            return r.destination && (r.destination.name || r.destination) || '—';
          }},
        { key: 'duration', label: 'Duration', fn: function (r) { return r.duration || '—'; }},
        { key: 'availabilityStatus', label: 'Availability', field: 'availabilityStatus' },
        { key: 'status', label: 'Status', type: 'status' },
      ],
      formFields: [
        { name: 'title', label: 'Title', type: 'text', required: true },
        { name: 'slug', label: 'Slug', type: 'text' },
        { name: 'price', label: 'Price', type: 'number', required: true },
        { name: 'duration', label: 'Duration', type: 'text' },
        { name: 'destination', label: 'Destination ID', type: 'text' },
        { name: 'category', label: 'Category ID', type: 'text' },
        { name: 'featured', label: 'Featured', type: 'checkbox' },
        { name: 'availabilityStatus', label: 'Availability Status', type: 'select', options: ['Available', 'Limited Seats', 'Sold Out'] },
        { name: 'travelType', label: 'Travel Type', type: 'text' },
        { name: 'travelDates', label: 'Travel Dates (comma-separated)', type: 'text' },
        { name: 'status', label: 'Status', type: 'select', options: ['active', 'inactive'] },
        { name: 'description', label: 'Overview', type: 'textarea' },
        { name: 'itinerary', label: 'Itinerary', type: 'textarea', apiField: 'description' },
        { name: 'imageUrl', label: 'Image URL', type: 'text', apiField: 'images' },
        { name: 'included', label: 'Included Details (one per line)', type: 'textarea' },
        { name: 'excluded', label: 'Excluded Details (one per line)', type: 'textarea' },
      ],
      toPayload: function (fd) {
        var p = {
          title: fd.title,
          slug: fd.slug || slugify(fd.title),
          price: Number(fd.price) || 0,
          duration: fd.duration || '',
          description: [fd.description, fd.itinerary].filter(Boolean).join('\n\n'),
          status: fd.status || 'active',
          featured: !!fd.featured,
          availabilityStatus: fd.availabilityStatus || 'Available',
          travelType: fd.travelType || 'Group Tour',
          travelDates: fd.travelDates ? fd.travelDates.split(',').map(function (d) { return d.trim(); }).filter(Boolean) : [],
          included: fd.included ? fd.included.split('\n').map(function (x) { return x.trim(); }).filter(Boolean) : [],
          excluded: fd.excluded ? fd.excluded.split('\n').map(function (x) { return x.trim(); }).filter(Boolean) : []
        };
        if (fd.destination) p.destination = fd.destination;
        if (fd.category) p.category = fd.category;
        if (fd.imageUrl) p.images = [fd.imageUrl];
        return p;
      },
    },
    destinations: {
      endpoint: '/destinations',
      mockKey: 'destinations',
      title: 'Destinations',
      listPage: 'destinations.html',
      formPage: 'destinations-form.html',
      statusPatch: true,
      columns: [
        { key: 'image', label: 'Image', type: 'image', field: 'image' },
        { key: 'title', label: 'Title', field: 'name' },
        { key: 'slug', label: 'Slug', field: 'slug' },
        { key: 'status', label: 'Status', type: 'status' },
      ],
      formFields: [
        { name: 'name', label: 'Title / Name', type: 'text', required: true },
        { name: 'slug', label: 'Slug', type: 'text' },
        { name: 'state', label: 'Region / State', type: 'text' },
        { name: 'image', label: 'Image URL', type: 'text' },
        { name: 'description', label: 'Overview', type: 'textarea' },
        { name: 'attractions', label: 'Attractions', type: 'textarea' },
        { name: 'bestTime', label: 'Best Time to Visit', type: 'text' },
        { name: 'status', label: 'Status', type: 'select', options: ['active', 'inactive'] },
      ],
      toPayload: function (fd) {
        var desc = fd.description || '';
        if (fd.attractions) desc += '\n\nAttractions: ' + fd.attractions;
        if (fd.bestTime) desc += '\n\nBest time: ' + fd.bestTime;
        return {
          name: fd.name,
          slug: fd.slug || slugify(fd.name),
          state: fd.state,
          image: fd.image,
          description: desc.trim(),
          status: fd.status || 'active',
        };
      },
    },
    categories: {
      endpoint: '/categories',
      mockKey: 'categories',
      title: 'Categories',
      listPage: 'categories.html',
      formPage: 'categories-form.html',
      statusPatch: true,
      columns: [
        { key: 'name', label: 'Name', field: 'name' },
        { key: 'slug', label: 'Slug', field: 'slug' },
        { key: 'status', label: 'Status', type: 'status' },
      ],
      formFields: [
        { name: 'name', label: 'Name', type: 'text', required: true },
        { name: 'slug', label: 'Slug', type: 'text' },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'status', label: 'Status', type: 'select', options: ['active', 'inactive'] },
      ],
      toPayload: function (fd) {
        return {
          name: fd.name,
          slug: fd.slug || slugify(fd.name),
          description: fd.description,
          status: fd.status || 'active',
        };
      },
    },
    inspirations: {
      endpoint: '/inspirations',
      mockKey: 'inspirations',
      title: 'Inspirations',
      listPage: 'inspirations.html',
      formPage: 'inspirations-form.html',
      statusPatch: true,
      columns: [
        { key: 'image', label: 'Image', type: 'image', field: 'images' },
        { key: 'title', label: 'Title', field: 'title' },
        { key: 'slug', label: 'Slug', field: 'slug' },
        { key: 'category', label: 'Category', fn: function (r) { return r.location || r.category || '—'; }},
        { key: 'status', label: 'Status', type: 'status' },
      ],
      formFields: [
        { name: 'title', label: 'Title', type: 'text', required: true },
        { name: 'slug', label: 'Slug', type: 'text' },
        { name: 'location', label: 'Category / Location', type: 'text' },
        { name: 'excerpt', label: 'Short Description', type: 'textarea' },
        { name: 'content', label: 'Content', type: 'textarea' },
        { name: 'imageUrl', label: 'Image URL', type: 'text' },
        { name: 'status', label: 'Status', type: 'select', options: ['active', 'inactive'] },
      ],
      toPayload: function (fd) {
        var p = {
          title: fd.title,
          slug: fd.slug || slugify(fd.title),
          excerpt: fd.excerpt,
          content: fd.content,
          location: fd.location,
          status: fd.status || 'active',
        };
        if (fd.imageUrl) p.images = [fd.imageUrl];
        return p;
      },
    },
    guiders: {
      endpoint: '/guiders',
      mockKey: 'guiders',
      title: 'Guiders',
      listPage: 'guiders.html',
      formPage: 'guiders-form.html',
      statusPatch: true,
      columns: [
        { key: 'image', label: 'Image', type: 'image', field: 'photo' },
        { key: 'name', label: 'Name', field: 'name' },
        { key: 'slug', label: 'Slug', field: 'slug' },
        { key: 'status', label: 'Status', type: 'status' },
      ],
      formFields: [
        { name: 'name', label: 'Name', type: 'text', required: true },
        { name: 'slug', label: 'Slug', type: 'text' },
        { name: 'bio', label: 'Bio', type: 'textarea' },
        { name: 'photo', label: 'Photo URL', type: 'text' },
        { name: 'status', label: 'Status', type: 'select', options: ['active', 'inactive'] },
      ],
      toPayload: function (fd) {
        return {
          name: fd.name,
          slug: fd.slug || slugify(fd.name),
          bio: fd.bio,
          photo: fd.photo,
          status: fd.status || 'active',
        };
      },
    },
    faqs: {
      endpoint: '/faqs',
      mockKey: 'faqs',
      title: 'FAQ',
      listPage: 'faq.html',
      formPage: 'faq-form.html',
      statusPatch: true,
      columns: [
        { key: 'question', label: 'Question', field: 'question' },
        { key: 'status', label: 'Status', type: 'status' },
      ],
      formFields: [
        { name: 'question', label: 'Question', type: 'text', required: true },
        { name: 'answer', label: 'Answer', type: 'textarea', required: true },
        { name: 'category', label: 'Category', type: 'text' },
        { name: 'status', label: 'Status', type: 'select', options: ['active', 'inactive'] },
      ],
      toPayload: function (fd) {
        return {
          question: fd.question,
          answer: fd.answer,
          category: fd.category,
          status: fd.status || 'active',
        };
      },
    },
    testimonials: {
      endpoint: '/testimonials',
      mockKey: 'testimonials',
      title: 'Testimonials',
      listPage: 'testimonials.html',
      formPage: 'testimonials-form.html',
      statusPatch: true,
      columns: [
        { key: 'image', label: 'Photo', type: 'image', field: 'photo' },
        { key: 'author', label: 'Author', field: 'author' },
        { key: 'title', label: 'Title', field: 'title' },
        { key: 'status', label: 'Status', type: 'status' },
      ],
      formFields: [
        { name: 'author', label: 'Author', type: 'text', required: true },
        { name: 'title', label: 'Title', type: 'text' },
        { name: 'text', label: 'Review Text', type: 'textarea', required: true },
        { name: 'rating', label: 'Rating (1-5)', type: 'number' },
        { name: 'designation', label: 'Designation', type: 'text' },
        { name: 'photo', label: 'Photo URL', type: 'text' },
        { name: 'status', label: 'Status', type: 'select', options: ['active', 'inactive'] },
      ],
      toPayload: function (fd) {
        return {
          author: fd.author,
          title: fd.title,
          text: fd.text,
          rating: Number(fd.rating) || 5,
          designation: fd.designation || 'GoFly Traveler',
          photo: fd.photo,
          status: fd.status || 'active',
        };
      },
    },
    gallery: {
      endpoint: '/gallery',
      mockKey: 'gallery',
      title: 'Gallery',
      listPage: 'gallery.html',
      formPage: 'gallery-form.html',
      statusPatch: true,
      columns: [
        { key: 'image', label: 'Image', type: 'image', field: 'image' },
        { key: 'title', label: 'Title', field: 'title' },
        { key: 'category', label: 'Category', field: 'category' },
        { key: 'status', label: 'Status', type: 'status' },
      ],
      formFields: [
        { name: 'title', label: 'Title', type: 'text', required: true },
        { name: 'image', label: 'Image URL', type: 'text', required: true },
        { name: 'category', label: 'Category', type: 'text' },
        { name: 'displayOrder', label: 'Display Order', type: 'number' },
        { name: 'status', label: 'Status', type: 'select', options: ['active', 'inactive'] },
      ],
      toPayload: function (fd) {
        return {
          title: fd.title,
          image: fd.image,
          category: fd.category,
          displayOrder: Number(fd.displayOrder) || 0,
          status: fd.status || 'active',
        };
      },
    },
  };

  function slugify(str) {
    return String(str || '')
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function cellValue(row, col) {
    if (col.fn) return col.fn(row);
    if (col.type === 'image') {
      var src = row[col.field];
      if (Array.isArray(src)) src = src[0];
      return src
        ? '<img src="' + src + '" alt="" class="admin-thumb">'
        : '<span class="admin-thumb d-inline-block"></span>';
    }
    if (col.type === 'status') {
      var st = row.status || 'inactive';
      return '<span class="admin-badge ' + st + '">' + st + '</span>';
    }
    return escapeHtml(row[col.field] != null ? row[col.field] : '—');
  }

  function escapeHtml(s) {
    var d = document.createElement('div');
    d.textContent = String(s);
    return d.innerHTML;
  }

  function showAdminMessage(message, type) {
    var main = document.querySelector('.admin-main');
    if (!main) return;
    var el = document.getElementById('admin-flash-message');
    if (!el) {
      el = document.createElement('div');
      el.id = 'admin-flash-message';
      el.className = 'admin-alert-banner';
      main.insertBefore(el, main.firstChild);
    }
    el.className =
      'admin-alert-banner ' + (type === 'success' ? 'border-success' : '');
    el.style.background = type === 'success' ? '#d4edda' : '#f8d7da';
    el.style.borderColor = type === 'success' ? '#28a745' : '#f5c6cb';
    el.style.color = type === 'success' ? '#155724' : '#721c24';
    el.textContent = message;
    el.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderTable(module, rows) {
    var thead = module.columns
      .map(function (c) {
        return '<th>' + c.label + '</th>';
      })
      .join('');
    var body = rows.length
      ? rows
          .map(function (row) {
            var id = row._id || row.id;
            var cells = module.columns
              .map(function (c) {
                return '<td>' + cellValue(row, c) + '</td>';
              })
              .join('');
            var nextStatus = row.status === 'active' ? 'inactive' : 'active';
            var toggle =
              '<button type="button" class="btn btn-sm btn-outline-secondary btn-toggle-status" data-id="' +
              id +
              '" data-status="' +
              nextStatus +
              '">Toggle</button> ';
            return (
              '<tr data-id="' +
              id +
              '">' +
              cells +
              '<td class="admin-actions text-nowrap">' +
              '<a href="' +
              module.formPage +
              '?id=' +
              encodeURIComponent(id) +
              '" class="btn btn-sm btn-primary">Edit</a> ' +
              toggle +
              '<button type="button" class="btn btn-sm btn-outline-danger btn-delete" data-id="' +
              id +
              '">Delete</button>' +
              '</td></tr>'
            );
          })
          .join('')
      : '<tr><td colspan="' +
        (module.columns.length + 1) +
        '" class="admin-empty">No records found.</td></tr>';

    return (
      '<table class="table table-hover admin-table"><thead><tr>' +
      thead +
      '<th>Actions</th></tr></thead><tbody>' +
      body +
      '</tbody></table>'
    );
  }

  function bindTableActions(module, wrap) {
    wrap.querySelectorAll('.btn-delete').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-id');
        if (!window.confirm('Delete this item?')) return;
        AdminAPI.delete(module.endpoint, id)
          .then(function () {
            showAdminMessage('Item deleted.', 'success');
            initListPage(module);
          })
          .catch(function (e) {
            showAdminMessage(e.message || 'Delete failed. Log in as admin.', 'error');
          });
      });
    });
    wrap.querySelectorAll('.btn-toggle-status').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-id');
        var status = btn.getAttribute('data-status');
        var p = module.statusPatch
          ? AdminAPI.patchStatus(module.endpoint, id, status)
          : AdminAPI.put(module.endpoint, id, { status: status });
        p.then(function () {
          initListPage(module);
        }).catch(function (e) {
          showAdminMessage(e.message || 'Status update failed.', 'error');
        });
      });
    });
  }

  function initListPage(module) {
    var wrap = document.getElementById('admin-table-wrap');
    if (!wrap) return;
    wrap.innerHTML = '<p class="text-muted">Loading…</p>';
    AdminAPI.get(module.endpoint, module.mockKey).then(function (res) {
      var note = res.mock
        ? '<p class="text-muted small mb-3"><i class="bi bi-info-circle"></i> Showing mock data (API unavailable or read-only).</p>'
        : '';
      wrap.innerHTML = note + renderTable(module, res.data || []);
      bindTableActions(module, wrap);
    });
  }

  function renderFormFields(module, record) {
    record = record || {};
    return module.formFields
      .map(function (f) {
        var val = record[f.name];
        if (val == null && f.apiField && record[f.apiField] != null) {
          val = record[f.apiField];
        }
        if (f.apiField === 'images' && Array.isArray(val)) val = val[0];
        
        // Format array values into strings for inputs
        if (Array.isArray(val)) {
          if (f.name === 'travelDates') {
            val = val.join(', ');
          } else if (f.name === 'included' || f.name === 'excluded') {
            val = val.join('\n');
          }
        }
        if (f.type === 'checkbox') {
          return (
            '<div class="col-md-6 mb-3"><div class="form-check mt-4">' +
            '<input class="form-check-input" type="checkbox" name="' +
            f.name +
            '" id="f-' +
            f.name +
            '"' +
            (val ? ' checked' : '') +
            '>' +
            '<label class="form-check-label" for="f-' +
            f.name +
            '">' +
            f.label +
            '</label></div></div>'
          );
        }
        if (f.type === 'select') {
          var opts = (f.options || [])
            .map(function (o) {
              return (
                '<option value="' +
                o +
                '"' +
                (val === o ? ' selected' : '') +
                '>' +
                o +
                '</option>'
              );
            })
            .join('');
          return (
            '<div class="col-md-6 mb-3"><label class="form-label">' +
            f.label +
            '</label><select class="form-select" name="' +
            f.name +
            '">' +
            opts +
            '</select></div>'
          );
        }
        if (f.type === 'textarea') {
          return (
            '<div class="col-12 mb-3"><label class="form-label">' +
            f.label +
            '</label><textarea class="form-control" name="' +
            f.name +
            '" rows="4">' +
            escapeHtml(val || '') +
            '</textarea></div>'
          );
        }
        return (
          '<div class="col-md-6 mb-3"><label class="form-label">' +
          f.label +
          '</label><input type="' +
          (f.type || 'text') +
          '" class="form-control" name="' +
          f.name +
          '" value="' +
          escapeHtml(val != null ? val : '') +
          '"' +
          (f.required ? ' required' : '') +
          '></div>'
        );
      })
      .join('');
  }

  function getFormData(form) {
    var fd = {};
    moduleFormFields(form).forEach(function (el) {
      var n = el.name;
      if (!n) return;
      if (el.type === 'checkbox') fd[n] = el.checked;
      else fd[n] = el.value;
    });
    return fd;
  }

  function moduleFormFields(form) {
    return Array.from(form.querySelectorAll('input, select, textarea'));
  }

  function initFormPage(module) {
    var form = document.getElementById('admin-form');
    var fieldsWrap = document.getElementById('admin-form-fields');
    if (!form || !fieldsWrap) return;

    var params = new URLSearchParams(window.location.search);
    var id = params.get('id');
    var isEdit = !!id;

    document.getElementById('admin-form-title').textContent = isEdit
      ? 'Edit ' + module.title.replace(/s$/, '')
      : 'Add ' + module.title.replace(/s$/, '');

    function showForm(record) {
      fieldsWrap.innerHTML = renderFormFields(module, record);
    }

    if (isEdit) {
      AdminAPI.getOne(module.endpoint, id, module.mockKey).then(function (res) {
        showForm(res.data || {});
      });
    } else {
      showForm({});
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var fd = getFormData(form);
      var payload = module.toPayload(fd);
      var promise = isEdit
        ? AdminAPI.put(module.endpoint, id, payload)
        : AdminAPI.post(module.endpoint, payload);
      promise
        .then(function () {
          window.location.href = module.listPage;
        })
        .catch(function (err) {
          showAdminMessage(
            err.message ||
              'Save failed. Log in as admin at ../login.html and ensure the API is running.',
            'error'
          );
        });
    });
  }

  function initDashboard() {
    var grid = document.getElementById('admin-stats-grid');
    if (!grid) return;
    var keys = Object.keys(MODULES);
    var promises = keys.map(function (key) {
      var m = MODULES[key];
      return AdminAPI.get(m.endpoint, m.mockKey).then(function (res) {
        return { key: key, title: m.title, count: (res.data || []).length };
      });
    });
    Promise.all(promises).then(function (stats) {
      grid.innerHTML = stats
        .map(function (s) {
          var m = MODULES[s.key];
          return (
            '<div class="admin-stat">' +
            '<h3>' +
            s.count +
            '</h3>' +
            '<p>' +
            s.title +
            '</p>' +
            '<a href="' +
            m.listPage +
            '" class="primary-btn1" style="margin-top:12px;display:inline-block;padding:8px 16px;font-size:13px;"><span>Manage</span></a>' +
            '</div>'
          );
        })
        .join('');
    });
  }

  window.AdminModules = {
    config: MODULES,
    init: function () {
      var body = document.body;
      var moduleKey = body.getAttribute('data-module');
      var page = body.getAttribute('data-page');
      if (!moduleKey) {
        if (page === 'dashboard') initDashboard();
        return;
      }
      var module = MODULES[moduleKey];
      if (!module) return;
      if (page === 'list') initListPage(module);
      if (page === 'form') initFormPage(module);
    },
  };

  document.addEventListener('DOMContentLoaded', function () {
    var nav = document.getElementById('admin-nav');
    if (nav) {
      var path = window.location.pathname.split('/').pop() || 'index.html';
      nav.querySelectorAll('a').forEach(function (a) {
        var href = a.getAttribute('href');
        if (href === path || (path === 'index.html' && href === 'index.html')) {
          a.classList.add('active');
        }
      });
    }
    AdminModules.init();
  });
})();
