import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Store.css';

// Additional CSS styles for the component
const additionalStyles = `
/* Form styling improvements */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.form-checkbox-group {
  display: flex;
  align-items: center;
  margin: 10px 0;
}

.form-checkbox {
  margin-right: 8px;
}

/* Loading indicator */
.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  font-size: 16px;
  color: #666;
}

/* Error message */
.error-message {
  background-color: #ffebee;
  color: #c62828;
  padding: 10px 15px;
  border-radius: 4px;
  margin: 10px 0;
  border-left: 4px solid #c62828;
}

/* Buttons for edit and delete */
.delete-button, .edit-button {
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 5px;
  margin-bottom: 5px;
}

.delete-button {
  background-color: #f44336;
  color: white;
}

.delete-button:hover {
  background-color: #d32f2f;
}

.edit-button {
  background-color: #2196F3;
  color: white;
}

.edit-button:hover {
  background-color: #0b7dda;
}

.cancel-button {
  background-color: #757575;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 15px;
  margin-left: 10px;
}

.cancel-button:hover {
  background-color: #616161;
}

.submit-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.delete-button:disabled, .edit-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
`;

function Store() {
	const [showSidebar, setShowSidebar] = useState(false);
	const [services, setServices] = useState([]);
	const [nailDesigns, setNailDesigns] = useState([]);
	const [categories, setCategories] = useState([]);
	const [activeTab, setActiveTab] = useState('services');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [designsLoading, setDesignsLoading] = useState(false);
	const [designsError, setDesignsError] = useState(null);
	const [categoriesLoading, setCategoriesLoading] = useState(false);
	const [categoriesError, setCategoriesError] = useState(null);
	const [editing, setEditing] = useState(false);
	const [currentEdit, setCurrentEdit] = useState(null);
	const [serviceEditing, setServiceEditing] = useState(false);

	const [newItem, setNewItem] = useState({
		name: '',
		price: '',
		category: '',
		duration: '',
		description: '',
		imageUrl: '',
		isAdditional: false,
		categoryIds: [],
		trendScore: '0',
		serviceId: '',
		extraPrice: '0',
	});

	const navigate = useNavigate();

	// Fetch services, designs, and categories from API when component mounts
	useEffect(() => {
		fetchServices();
		fetchDesigns();
		fetchCategories();
	}, []);

	// Fetch categories from API
	const fetchCategories = async () => {
		setCategoriesLoading(true);
		setCategoriesError(null);
		try {
			const response = await fetch(
				'https://inbsapi-d9hhfmhsapgabrcz.southeastasia-01.azurewebsites.net/api/Adjective/Categories'
			);

			const data = await response.json();
			console.log('Fetched categories:', data);
			setCategories(data);
		} catch (err) {
			setCategoriesError(err.message);
			console.error('Error fetching categories:', err);
		} finally {
			setCategoriesLoading(false);
		}
	};

	// Fetch services from API
	const fetchServices = async () => {
		setLoading(true);
		setError(null);
		try {
			const response = await fetch(
				'https://inbsapi-d9hhfmhsapgabrcz.southeastasia-01.azurewebsites.net/odata/Service'
			);

			const data = await response.json();

			// Transform API data to match the format we're using in the component
			// The OData response has the services in the "value" array
			const formattedServices = data.value.map((item) => ({
				id: item.ID,
				name: item.Name,
				price: item.Price,
				// For now, we'll use "N/A" for category since it's not clear from the response
				// how CategoryServices is structured in the OData format
				category: 'N/A',
				duration: item.AverageDuration,
				description: item.Description,
				imageUrl: item.ImageUrl || '',
				isAdditional: item.IsAdditional,
				createdAt: item.CreatedAt,
				lastModifiedAt: item.LastModifiedAt,
			}));

			setServices(formattedServices);
		} catch (err) {
			setError(err.message);
			console.error('Error fetching services:', err);
		} finally {
			setLoading(false);
		}
	};

	// Fetch designs from API
	const fetchDesigns = async () => {
		setDesignsLoading(true);
		setDesignsError(null);
		try {
			// Use expanded query to include service details
			const response = await fetch(
				'https://inbsapi-d9hhfmhsapgabrcz.southeastasia-01.azurewebsites.net/odata/Design'
			);

			const data = await response.json();
			console.log('Fetched designs data:', data); // Debug log to see structure

			// Transform API data to match our component format
			const formattedDesigns = data.value.map((item) => {
				console.log('Processing design item:', item); // Debug each item

				// Extract service relationship if it exists
				let serviceInfo = null;
				if (item.Services && Array.isArray(item.Services) && item.Services.length > 0) {
					serviceInfo = item.Services[0];
					console.log('Found service info for design:', serviceInfo); // Debug service info
				}

				return {
					id: item.ID,
					name: item.Name,
					price: item.Price,
					trendScore: item.TrendScore,
					description: item.Description,
					averageRating: item.AverageRating,
					createdAt: item.CreatedAt,
					lastModifiedAt: item.LastModifiedAt,
					// Service relationship - check different possible property names
					serviceId: serviceInfo
						? serviceInfo.ServiceID || serviceInfo.serviceId || serviceInfo.ServiceId
						: null,
					extraPrice: serviceInfo ? serviceInfo.ExtraPrice || serviceInfo.extraPrice || 0 : 0,
					// Store the full Services array in case we need it
					services: item.Services || [],
				};
			});

			console.log('Formatted designs:', formattedDesigns); // Debug final data
			setNailDesigns(formattedDesigns);
		} catch (err) {
			setDesignsError(err.message);
			console.error('Error fetching designs:', err);
		} finally {
			setDesignsLoading(false);
		}
	};

	// Add new service to API
	const addService = async (serviceData) => {
		setLoading(true);
		setError(null);
		try {
			console.log('Adding service with data:', serviceData); // Debug log

			// Create form data for multipart/form-data request
			const formData = new FormData();

			// Add the basic fields
			formData.append('Name', serviceData.name);
			formData.append('Description', serviceData.description);
			formData.append('Price', parseFloat(serviceData.price));

			// Set default image URL if none provided
			const defaultImageUrl =
				'https://firebasestorage.googleapis.com/v0/b/fir-realtime-database-49344.appspot.com/o/images%2Fnoimage.jpg?alt=media&token=8ffe560a-6aeb-4a34-8ebc-16693bb10a56';

			// If imageUrl is provided, use it, otherwise use default
			formData.append('ImageUrl', serviceData.imageUrl || defaultImageUrl);

			// Handle NewImage - for now we don't have file upload in our UI
			// formData.append('NewImage', null);

			// IsAdditional
			formData.append('IsAdditional', serviceData.isAdditional || false);

			// Average Duration (in minutes)
			formData.append('AverageDuration', parseInt(serviceData.duration) || 0);

			// Category IDs - handle from our category dropdown
			if (serviceData.categoryIds && serviceData.categoryIds.length > 0) {
				serviceData.categoryIds.forEach((id, index) => {
					formData.append(`CategoryIds[${index}]`, id);
				});
			} else if (serviceData.category) {
				// If no direct categoryIds but a category is selected, parse it
				formData.append(`CategoryIds[0]`, serviceData.category);
			}

			// Designs - include if available
			if (serviceData.designs && serviceData.designs.length > 0) {
				serviceData.designs.forEach((design, index) => {
					if (design.designId) {
						formData.append(`Designs[${index}].designId`, design.designId);
					}
					if (design.extraPrice) {
						formData.append(`Designs[${index}].extraPrice`, parseFloat(design.extraPrice));
					}
				});
			}

			// Log the form data for debugging
			for (let pair of formData.entries()) {
				console.log(pair[0] + ': ' + pair[1]);
			}

			const response = await fetch(
				'https://inbsapi-d9hhfmhsapgabrcz.southeastasia-01.azurewebsites.net/api/Service',
				{
					method: 'POST',
					body: formData,
				}
			);

			// Get the response for debugging
			const responseData = await response.json();
			console.log('Add service response:', responseData);

			// Refresh services after adding
			await fetchServices();
		} catch (err) {
			console.error('Error adding service:', err);
		} finally {
			setLoading(false);
		}
	};

	// Update service in API
	const updateService = async (serviceData) => {
		setLoading(true);
		setError(null);
		try {
			console.log('Updating service with data:', serviceData); // Debug log

			// Create form data for multipart/form-data request
			const formData = new FormData();

			// Add the id parameter to the query
			const url = `https://inbsapi-d9hhfmhsapgabrcz.southeastasia-01.azurewebsites.net/api/Service?id=${serviceData.id}`;

			// Add the basic fields
			formData.append('Name', serviceData.name);
			formData.append('Description', serviceData.description);
			formData.append('Price', parseFloat(serviceData.price));

			// Set default image URL if none provided
			const defaultImageUrl =
				'https://firebasestorage.googleapis.com/v0/b/fir-realtime-database-49344.appspot.com/o/images%2Fnoimage.jpg?alt=media&token=8ffe560a-6aeb-4a34-8ebc-16693bb10a56';

			// If imageUrl is provided, use it, otherwise use default
			formData.append('ImageUrl', serviceData.imageUrl || defaultImageUrl);

			// IsAdditional
			formData.append('IsAdditional', serviceData.isAdditional || false);

			// Average Duration (in minutes)
			formData.append('AverageDuration', parseInt(serviceData.duration) || 0);

			// Category IDs - use directly if available
			if (serviceData.categoryIds && serviceData.categoryIds.length > 0) {
				serviceData.categoryIds.forEach((id, index) => {
					formData.append(`CategoryIds[${index}]`, id);
				});
			} else if (serviceData.category) {
				// If no direct categoryIds but a category is selected, use that
				formData.append(`CategoryIds[0]`, serviceData.category);
			}

			// Designs - only include if there are any to avoid transaction issues
			if (serviceData.designs && serviceData.designs.length > 0) {
				serviceData.designs.forEach((design, index) => {
					if (design.designId) {
						formData.append(`Designs[${index}].designId`, design.designId);
						// Always include extraPrice if we have a designId
						formData.append(`Designs[${index}].extraPrice`, parseFloat(design.extraPrice || 0));
					}
				});
			}

			// Log the form data for debugging
			console.log('Sending form data to API:');
			for (let pair of formData.entries()) {
				console.log(pair[0] + ': ' + pair[1]);
			}

			// Try with different headers
			const response = await fetch(url, {
				method: 'PUT',
				body: formData,
				headers: {
					// Do not set Content-Type header as the browser will set it with boundary for FormData
					Accept: 'application/json',
				},
			});

			console.log('Response status:', response.status);

			// Get the response for debugging
			let responseData;
			try {
				responseData = await response.json();
				console.log('Update service response:', responseData);
			} catch (e) {
				console.log('Response is not JSON:', e.message);
				// Still consider this a success if the status code was good
			}

			// Add a small delay before fetching to allow the server to complete its transaction
			setTimeout(async () => {
				// Refresh services after updating
				await fetchServices();

				// Reset editing state
				setServiceEditing(false);
				setCurrentEdit(null);
			}, 500);
		} catch (err) {
			setError(err.message);
			console.error('Error updating service:', err);
		} finally {
			setLoading(false);
		}
	};

	// Delete service from API
	const deleteService = async (id) => {
		setLoading(true);
		setError(null);
		try {
			const response = await fetch(
				`https://inbsapi-d9hhfmhsapgabrcz.southeastasia-01.azurewebsites.net/api/Service?id=${id}`,
				{
					method: 'DELETE',
				}
			);

			// Remove from local state
			setServices(services.filter((item) => item.id !== id));
		} catch (err) {
			setError(err.message);
			console.error('Error deleting service:', err);
		} finally {
			setLoading(false);
		}
	};

	// Add design to API
	const addDesign = async (designData) => {
		setDesignsLoading(true);
		setDesignsError(null);
		try {
			console.log('Adding design with data:', designData); // Debug log

			// Create form data for multipart/form-data request
			const formData = new FormData();

			// Add basic fields
			formData.append('Name', designData.name);
			formData.append('Description', designData.description);
			formData.append('Price', parseFloat(designData.price) || 0);
			formData.append('TrendScore', parseInt(designData.trendScore) || 0);

			// Add service association if a service is selected
			if (designData.serviceId) {
				// Try both formats to ensure compatibility with the API
				formData.append('Services[0].ServiceID', designData.serviceId);
				formData.append('Services[0].ExtraPrice', parseFloat(designData.extraPrice) || 0);

				// Log what we're sending to the API
				console.log('Including service with ID:', designData.serviceId);
				console.log('and extra price:', designData.extraPrice);
			}

			// Log the form data for debugging
			for (let pair of formData.entries()) {
				console.log(pair[0] + ': ' + pair[1]);
			}

			const response = await fetch(
				'https://inbsapi-d9hhfmhsapgabrcz.southeastasia-01.azurewebsites.net/api/Design',
				{
					method: 'POST',
					body: formData,
				}
			);

			// Get the response for debugging
			const responseData = await response.json();
			console.log('Add response:', responseData);

			// Refresh designs after adding
			await fetchDesigns();
		} catch (err) {
			setDesignsError(err.message);
			console.error('Error adding design:', err);
		} finally {
			setDesignsLoading(false);
		}
	};

	// Update design in API
	const updateDesign = async (designData) => {
		setDesignsLoading(true);
		setDesignsError(null);
		try {
			console.log('Updating design with data:', designData); // Debug log

			// Create form data for multipart/form-data request
			const formData = new FormData();

			// Add the id parameter to the query
			const url = `https://inbsapi-d9hhfmhsapgabrcz.southeastasia-01.azurewebsites.net/api/Design?id=${designData.id}`;

			// Add basic fields
			formData.append('ID', designData.id);
			formData.append('Name', designData.name);
			formData.append('Description', designData.description);
			formData.append('Price', parseFloat(designData.price) || 0);
			formData.append('TrendScore', parseInt(designData.trendScore) || 0);

			// Always include Services array, even if empty
			// Add service association if a service is selected
			if (designData.serviceId) {
				// Try both formats to ensure compatibility with the API
				formData.append('Services[0].ServiceID', designData.serviceId);
				formData.append('Services[0].ExtraPrice', parseFloat(designData.extraPrice) || 0);

				// Alternative format that might be expected by the API
				formData.append('Services[0].DesignID', designData.id);

				// Log what we're sending to the API
				console.log('Including service with ID:', designData.serviceId);
				console.log('and extra price:', designData.extraPrice);
			} else {
				// If no service is selected, explicitly set an empty array
				formData.append('Services', JSON.stringify([]));
			}

			// Log the form data for debugging
			for (let pair of formData.entries()) {
				console.log(pair[0] + ': ' + pair[1]);
			}

			const response = await fetch(url, {
				method: 'PUT',
				body: formData,
			});

			// Get the response for debugging
			const responseData = await response.json();
			console.log('Update response:', responseData);

			// Refresh designs after updating
			await fetchDesigns();

			// Reset editing state
			setEditing(false);
			setCurrentEdit(null);
		} catch (err) {
			setDesignsError(err.message);
			console.error('Error updating design:', err);
		} finally {
			setDesignsLoading(false);
		}
	};

	// Delete design from API
	const deleteDesign = async (id) => {
		setDesignsLoading(true);
		setDesignsError(null);
		try {
			const response = await fetch(
				`https://inbsapi-d9hhfmhsapgabrcz.southeastasia-01.azurewebsites.net/api/Design?id=${id}`,
				{
					method: 'DELETE',
				}
			);

			// Remove from local state
			setNailDesigns(nailDesigns.filter((item) => item.id !== id));
		} catch (err) {
			setDesignsError(err.message);
			console.error('Error deleting design:', err);
		} finally {
			setDesignsLoading(false);
		}
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setNewItem((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = (e) => {
		e.preventDefault();

		if (activeTab === 'services') {
			if (serviceEditing && currentEdit) {
				// Update existing service
				updateService({ ...newItem, id: currentEdit.id });
			} else {
				// Add new service
				addService(newItem);
			}
		} else {
			if (editing && currentEdit) {
				// Update existing design
				updateDesign({ ...newItem, id: currentEdit.id });
			} else {
				// Add new design
				addDesign(newItem);
			}
		}

		// Clear form
		setNewItem({
			name: '',
			price: '',
			category: '',
			duration: '',
			description: '',
			imageUrl: '',
			isAdditional: false,
			categoryIds: [],
			trendScore: '0',
			serviceId: '',
			extraPrice: '0',
		});

		// Reset editing states
		setEditing(false);
		setServiceEditing(false);
		setCurrentEdit(null);
	};

	const handleEdit = (item) => {
		// Set editing mode based on active tab
		if (activeTab === 'services') {
			setServiceEditing(true);
		} else {
			setEditing(true);
		}

		setCurrentEdit(item);

		// Populate form with item data
		setNewItem({
			name: item.name,
			price: item.price?.toString() || '0',
			category: item.category || '',
			duration: item.duration?.toString() || '0',
			description: item.description || '',
			imageUrl: item.imageUrl || '',
			isAdditional: item.isAdditional || false,
			categoryIds: item.categoryIds || [],
			trendScore: item.trendScore?.toString() || '0',
			serviceId: item.serviceId || '',
			extraPrice: item.extraPrice?.toString() || '0',
			// Store any designs associated with this service
			designs: item.designs || [],
			// Store the ID for updates
			id: item.id,
		});

		// Scroll to form
		document.querySelector('.product-form').scrollIntoView({ behavior: 'smooth' });
	};

	const handleDelete = (id) => {
		if (activeTab === 'services') {
			// Delete service from API
			deleteService(id);
		} else {
			// Delete design from API
			deleteDesign(id);
		}
	};

	// Find service name by ID
	const getServiceNameById = (serviceId) => {
		if (!serviceId) return 'No Service';
		const service = services.find((s) => s.id === serviceId);
		return service ? service.name : 'Unknown Service';
	};

	// Find category name by ID
	const getCategoryNameById = (categoryId) => {
		if (!categoryId) return 'N/A';
		const category = categories.find((c) => c.id.toString() === categoryId.toString());
		return category ? category.name : `Category ${categoryId}`;
	};

	const handleLogout = () => navigate('/');
	const handleHome = () => navigate('/home');
	const handleArtist = () => navigate('/artist');
	const handleWaitlist = () => navigate('/waitlist');

	return (
		<>
			<style>{additionalStyles}</style>
			<div className='store-container'>
				{/* Sidebar */}
				<div
					className={`sidebar ${showSidebar ? 'expanded' : ''}`}
					onMouseEnter={() => setShowSidebar(true)}
					onMouseLeave={() => setShowSidebar(false)}
				>
					<div className='logo-container'>
						<h1 className='logo'>{showSidebar ? 'INBS' : 'IB'}</h1>
					</div>

					<div className='sidebar-buttons'>
						<button className='sidebar-button' onClick={handleHome}>
							<span
								className='button-icon'
								style={{ marginRight: '12px', marginLeft: '-12px', fontSize: '20px' }}
							>
								🏠
							</span>
							{showSidebar && 'Home'}
						</button>

						<button className='sidebar-button' onClick={handleArtist}>
							<span
								className='button-icon'
								style={{ marginRight: '12px', marginLeft: '-12px', fontSize: '20px' }}
							>
								🎨
							</span>
							{showSidebar && 'Artist'}
						</button>

						<button className='sidebar-button' onClick={handleWaitlist}>
							<span
								className='button-icon'
								style={{ marginRight: '12px', marginLeft: '-12px', fontSize: '20px' }}
							>
								⏳
							</span>
							{showSidebar && 'Waitlist'}
						</button>

						<button className='sidebar-button' onClick={handleLogout}>
							<span
								className='button-icon'
								style={{ marginRight: '12px', marginLeft: '-12px', fontSize: '20px' }}
							>
								⬅️
							</span>
							{showSidebar && 'Logout'}
						</button>
					</div>
				</div>

				{/* Main Content */}
				<div className={`main-content ${showSidebar ? 'sidebar-expanded' : ''}`}>
					<div className='header'>
						<h1 className='page-title'>Services & Nail Designs Management</h1>
					</div>

					<div className='tabs'>
						<button
							className={`tab-button ${activeTab === 'services' ? 'active' : ''}`}
							onClick={() => setActiveTab('services')}
						>
							Nail Services
						</button>
						<button
							className={`tab-button ${activeTab === 'designs' ? 'active' : ''}`}
							onClick={() => setActiveTab('designs')}
						>
							Nail Designs
						</button>
					</div>

					{/* Show error message if there's an error */}
					{(activeTab === 'services' ? error : designsError) && (
						<div className='error-message'>Error: {activeTab === 'services' ? error : designsError}</div>
					)}

					<div className='product-form'>
						<h2 className='section-title'>
							{activeTab === 'services'
								? serviceEditing
									? 'Edit Service'
									: 'Add New Service'
								: editing
								? 'Edit Nail Design'
								: 'Add New Design'}
						</h2>
						<form onSubmit={handleSubmit}>
							<div className='form-grid'>
								<input
									type='text'
									name='name'
									placeholder={activeTab === 'services' ? 'Service name' : 'Design name'}
									value={newItem.name}
									onChange={handleInputChange}
									required
									className='form-input'
								/>
								<input
									type='number'
									name='price'
									placeholder='Price (VND)'
									value={newItem.price}
									onChange={handleInputChange}
									required
									className='form-input'
								/>
								<select
									name='category'
									value={newItem.category}
									onChange={handleInputChange}
									required={activeTab === 'services'}
									className='form-input'
								>
									<option value=''>Select category</option>
									{activeTab === 'services' ? (
										categoriesLoading ? (
											<option disabled>Loading categories...</option>
										) : categoriesError ? (
											<option disabled>Error loading categories</option>
										) : (
											categories.map((category) => (
												<option key={category.id} value={category.id}>
													{category.name}
												</option>
											))
										)
									) : (
										<>
											{categoriesLoading ? (
												<option disabled>Loading categories...</option>
											) : categoriesError ? (
												<option disabled>Error loading categories</option>
											) : (
												categories.map((category) => (
													<option key={category.id} value={category.id}>
														{category.name}
													</option>
												))
											)}
										</>
									)}
								</select>
								{activeTab === 'services' ? (
									<>
										<input
											type='number'
											name='duration'
											placeholder='Duration (minutes)'
											value={newItem.duration}
											onChange={handleInputChange}
											required
											className='form-input'
										/>
										<div className='form-checkbox-group'>
											<label>
												<input
													type='checkbox'
													name='isAdditional'
													checked={newItem.isAdditional}
													onChange={(e) =>
														setNewItem({ ...newItem, isAdditional: e.target.checked })
													}
													className='form-checkbox'
												/>
												Is Additional Service
											</label>
										</div>
									</>
								) : (
									<>
										<input
											type='number'
											name='trendScore'
											placeholder='Trend Score (0-10)'
											value={newItem.trendScore}
											onChange={handleInputChange}
											className='form-input'
											min='0'
											max='10'
										/>
										<select
											name='serviceId'
											value={newItem.serviceId}
											onChange={handleInputChange}
											className='form-input'
											required
										>
											<option value=''>Select a service</option>
											{services.map((service) => (
												<option key={service.id} value={service.id}>
													{service.name}
												</option>
											))}
										</select>
										<input
											type='number'
											name='extraPrice'
											placeholder='Extra Price'
											value={newItem.extraPrice}
											onChange={handleInputChange}
											className='form-input'
											min='0'
										/>
									</>
								)}
								<input
									type='text'
									name='imageUrl'
									placeholder='Image URL'
									value={newItem.imageUrl}
									onChange={handleInputChange}
									className='form-input'
								/>
								<textarea
									name='description'
									placeholder='Description'
									value={newItem.description}
									onChange={handleInputChange}
									required
									className='form-input'
								/>
							</div>
							<button
								type='submit'
								className='submit-button'
								disabled={activeTab === 'services' ? loading : designsLoading}
							>
								{(activeTab === 'services' ? loading : designsLoading)
									? 'Processing...'
									: editing || serviceEditing
									? 'Update'
									: 'Add New'}
							</button>
							{(editing || serviceEditing) && (
								<button
									type='button'
									className='cancel-button'
									onClick={() => {
										setEditing(false);
										setServiceEditing(false);
										setCurrentEdit(null);
										setNewItem({
											name: '',
											price: '',
											category: '',
											duration: '',
											description: '',
											imageUrl: '',
											isAdditional: false,
											categoryIds: [],
											trendScore: '0',
											serviceId: '',
											extraPrice: '0',
										});
									}}
								>
									Cancel
								</button>
							)}
						</form>
					</div>

					<div className='product-list'>
						<h2 className='section-title'>{activeTab === 'services' ? 'Services List' : 'Designs List'}</h2>

						{(activeTab === 'services' ? loading : designsLoading) && (
							<div className='loading'>Loading...</div>
						)}

						<table className='product-table'>
							<thead>
								<tr className='product-table-header'>
									<th className='product-table-header-cell'>Name</th>
									<th className='product-table-header-cell'>Price</th>
									{activeTab === 'services' ? (
										<>
											<th className='product-table-header-cell'>Category</th>
											<th className='product-table-header-cell'>Duration</th>
										</>
									) : (
										<>
											<th className='product-table-header-cell'>Trend Score</th>
											<th className='product-table-header-cell'>Service</th>
											<th className='product-table-header-cell'>Extra Price</th>
										</>
									)}
									<th className='product-table-header-cell'>Description</th>
									{activeTab === 'services' && <th className='product-table-header-cell'>Image</th>}
									{activeTab === 'designs' && (
										<th className='product-table-header-cell'>Average Rating</th>
									)}
									<th className='product-table-header-cell'>Actions</th>
								</tr>
							</thead>
							<tbody>
								{(activeTab === 'services' ? services : nailDesigns).map((item) => (
									<tr key={item.id} className='product-table-row'>
										<td className='product-table-cell'>{item.name}</td>
										<td className='product-table-cell'>{item.price || 0}</td>
										{activeTab === 'services' ? (
											<>
												<td className='product-table-cell'>
													{getCategoryNameById(item.category)}
												</td>
												<td className='product-table-cell'>{item.duration}</td>
											</>
										) : (
											<>
												<td className='product-table-cell'>{item.trendScore || 0}</td>
												<td className='product-table-cell'>
													{getServiceNameById(item.serviceId)}
												</td>
												<td className='product-table-cell'>{item.extraPrice || 0}</td>
											</>
										)}
										<td className='product-table-cell'>{item.description}</td>
										{activeTab === 'services' && (
											<td className='product-table-cell'>
												<img
													src={
														item.imageUrl ||
														'https://firebasestorage.googleapis.com/v0/b/fir-realtime-database-49344.appspot.com/o/images%2Fnoimage.jpg?alt=media&token=8ffe560a-6aeb-4a34-8ebc-16693bb10a56'
													}
													alt={item.name}
													style={{ width: '100px', height: '100px' }}
												/>
											</td>
										)}
										{activeTab === 'designs' && (
											<td className='product-table-cell'>{item.averageRating || 0}</td>
										)}
										<td className='product-table-cell'>
											<button
												onClick={() => handleDelete(item.id)}
												className='delete-button'
												disabled={activeTab === 'services' ? loading : designsLoading}
											>
												Delete
											</button>
											<button
												onClick={() => handleEdit(item)}
												className='edit-button'
												disabled={activeTab === 'services' ? loading : designsLoading}
											>
												Edit
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</>
	);
}

export default Store;