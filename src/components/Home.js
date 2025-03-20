import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Home.css';
import '../data.json';
import { PieChart, Pie, Cell, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

function Home() {
	const [bookings, setBookings] = useState([]);
	const [stores, setStores] = useState([]);
	const [showSidebar, setShowSidebar] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
	const [filters, setFilters] = useState({
		service: '',
		store: '',
		price: '',
	});
	const [selectedImage, setSelectedImage] = useState(null);
	const [selectedStore, setSelectedStore] = useState(null);
	const [selectedMonth, setSelectedMonth] = useState('all');
	const [showAddStoreForm, setShowAddStoreForm] = useState(false);
	const [newStoreData, setNewStoreData] = useState({
		address: '',
		description: '',
		imageUrl: '',
		status: 1,
	});
	const [selectedFile, setSelectedFile] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });
	const [editMode, setEditMode] = useState(false);
	const [editStoreId, setEditStoreId] = useState(null);
	const navigate = useNavigate();

	useEffect(() => {
		fetchBookings();
		fetchStores();
	}, []);

	const fetchBookings = async () => {
		try {
			const response = await fetch('https://6772b9a7ee76b92dd49333cb.mockapi.io/Booking');
			const data = await response.json();
			// Ensure data is an array before setting state
			if (Array.isArray(data)) {
				setBookings(data);
			} else {
				setBookings([]); // Set empty array if data is not an array
				console.error('Fetched data is not an array:', data);
			}
		} catch (error) {
			console.error('Error fetching bookings:', error);
			setBookings([]); // Set empty array on error
		}
	};

	// Fetch store data from API
	const fetchStores = async () => {
		try {
			const response = await fetch(
				'https://inbsapi-d9hhfmhsapgabrcz.southeastasia-01.azurewebsites.net/api/Store'
			);

			if (!response.ok) {
				throw new Error(`API request failed with status ${response.status}`);
			}

			const data = await response.json();
			setStores(data);
		} catch (error) {
			console.error('Error fetching store data:', error);
			setStores([]);
		}
	};

	// Handle form input changes
	const handleStoreInputChange = (e) => {
		const { name, value } = e.target;
		setNewStoreData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	// Handle file selection
	const handleFileChange = (e) => {
		if (e.target.files && e.target.files[0]) {
			setSelectedFile(e.target.files[0]);
		}
	};

	// Submit new store
	const handleSubmitNewStore = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);
		setSubmitMessage({ type: '', text: '' });

		try {
			const formData = new FormData();
			formData.append('Address', newStoreData.address);
			formData.append('Description', newStoreData.description);

			// If there's a URL provided, use it
			if (newStoreData.imageUrl) {
				formData.append('ImageUrl', newStoreData.imageUrl);
			}

			// If there's a file selected, add it
			if (selectedFile) {
				formData.append('NewImage', selectedFile);
			}

			formData.append('Status', newStoreData.status);

			let url = 'https://inbsapi-d9hhfmhsapgabrcz.southeastasia-01.azurewebsites.net/api/Store';
			let method = 'POST';

			// If in edit mode, use PUT method with the store ID
			if (editMode && editStoreId) {
				url = `https://inbsapi-d9hhfmhsapgabrcz.southeastasia-01.azurewebsites.net/api/Store?id=${editStoreId}`;
				method = 'PUT';
			}

			const response = await fetch(url, {
				method: method,
				body: formData,
			});

			if (!response.ok) {
				throw new Error(`API request failed with status ${response.status}`);
			}

			// Success
			setSubmitMessage({
				type: 'success',
				text: editMode ? 'Store updated successfully!' : 'Store created successfully!',
			});

			// Reset form
			setNewStoreData({
				address: '',
				description: '',
				imageUrl: '',
				status: 1,
			});
			setSelectedFile(null);
			setEditMode(false);
			setEditStoreId(null);

			// Refresh stores list
			fetchStores();

			// Hide form after 2 seconds
			setTimeout(() => {
				setShowAddStoreForm(false);
				setSubmitMessage({ type: '', text: '' });
			}, 2000);
		} catch (error) {
			console.error('Error with store operation:', error);
			setSubmitMessage({
				type: 'error',
				text: `Failed to ${editMode ? 'update' : 'create'} store: ${error.message}`,
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	// Handle edit store
	const handleEditStore = (store) => {
		// Close any open modals
		setSelectedStore(null);

		// Set form to edit mode
		setEditMode(true);
		setEditStoreId(store.id);

		// Populate form with store data
		setNewStoreData({
			address: store.address,
			description: store.description,
			imageUrl: store.imageUrl,
			status: parseInt(store.status),
		});

		// Show the form
		setShowAddStoreForm(true);

		// Scroll to form
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	// Handle delete store
	const handleDeleteStore = async (storeId) => {
		if (window.confirm('Are you sure you want to delete this store?')) {
			try {
				const response = await fetch(
					`https://inbsapi-d9hhfmhsapgabrcz.southeastasia-01.azurewebsites.net/api/Store?id=${storeId}`,
					{
						method: 'DELETE',
					}
				);

				if (!response.ok) {
					throw new Error(`API request failed with status ${response.status}`);
				}

				// Show success message in alert
				alert('Store deleted successfully!');

				// Refresh stores list
				fetchStores();

				// Close any open modals
				setSelectedStore(null);
			} catch (error) {
				console.error('Error deleting store:', error);
				alert(`Failed to delete store: ${error.message}`);
			}
		}
	};

	// Format date for display
	const formatDate = (dateString) => {
		const date = new Date(dateString);
		return new Intl.DateTimeFormat('en-US', {
			year: 'numeric',
			month: 'short',
			day: '2-digit',
		}).format(date);
	};

	const handleLogout = () => {
		navigate('/');
	};

	const handleStore = () => {
		navigate('/store');
	};

	const handleArtist = () => {
		navigate('/artist');
	};

	const handleAccessory = () => {
		navigate('/accessory');
	};

	const handleWaitlist = () => navigate('/waitlist');

	// Search function
	const handleSearch = (event) => {
		setSearchTerm(event.target.value);
	};

	// Sort function
	const requestSort = (key) => {
		let direction = 'ascending';
		if (sortConfig.key === key && sortConfig.direction === 'ascending') {
			direction = 'descending';
		}
		setSortConfig({ key, direction });
	};

	// Filter function
	const handleFilterChange = (event) => {
		const { name, value } = event.target;
		setFilters((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const getUniqueValues = (key) => {
		return [...new Set(bookings.map((booking) => booking[key]))];
	};

	// Helper function to filter bookings by month
	const filterBookingsByMonth = (bookings) => {
		if (selectedMonth === 'all') return bookings;

		return bookings.filter((booking) => {
			const bookingDate = new Date(booking.date);
			const bookingMonth = bookingDate.getMonth() + 1; // getMonth() returns 0-11
			return bookingMonth === parseInt(selectedMonth);
		});
	};

	// Get data for pie chart
	const getPieChartData = () => {
		const filteredBookings = filterBookingsByMonth(bookings);
		const serviceCount = {};
		filteredBookings.forEach((booking) => {
			serviceCount[booking.service] = (serviceCount[booking.service] || 0) + 1;
		});

		return Object.entries(serviceCount).map(([name, value]) => ({
			name,
			value,
		}));
	};

	// Get data for price bar chart
	const getPriceChartData = () => {
		const filteredBookings = filterBookingsByMonth(bookings);
		const priceRanges = {
			'200,000-250,000': 0,
			'250,001-500,000': 0,
			'500,001-1,000,000': 0,
			'1,000,001-2,000,000': 0,
			'2,000,000+': 0,
		};

		filteredBookings.forEach((booking) => {
			const price = Number(booking.price);
			if (price <= 250000) {
				priceRanges['200,000-250,000']++;
			} else if (price <= 500000) {
				priceRanges['250,001-500,000']++;
			} else if (price <= 1000000) {
				priceRanges['500,001-1,000,000']++;
			} else if (price <= 2000000) {
				priceRanges['1,000,001-2,000,000']++;
			} else {
				priceRanges['2,000,000+']++;
			}
		});

		return Object.entries(priceRanges).map(([range, count]) => ({
			range,
			count,
		}));
	};

	const getRevenueData = () => {
		const filteredBookings = filterBookingsByMonth(bookings);
		const storeRevenue = {};
		filteredBookings.forEach((booking) => {
			if (!storeRevenue[booking.store]) {
				storeRevenue[booking.store] = 0;
			}
			storeRevenue[booking.store] += Number(booking.price);
		});

		return Object.entries(storeRevenue).map(([name, value]) => ({
			name,
			value,
		}));
	};

	const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'];

	const filteredAndSortedBookings = bookings
		.filter((booking) => {
			const matchesSearch = Object.values(booking).join(' ').toLowerCase().includes(searchTerm.toLowerCase());

			const matchesServiceFilter = filters.service === '' || booking.service === filters.service;
			const matchesStoreFilter = filters.store === '' || booking.store === filters.store;

			return matchesSearch && matchesServiceFilter && matchesStoreFilter;
		})
		.sort((a, b) => {
			if (!sortConfig.key) return 0;

			if (sortConfig.key === 'price') {
				return sortConfig.direction === 'ascending'
					? Number(a.price) - Number(b.price)
					: Number(b.price) - Number(a.price);
			}

			if (a[sortConfig.key] < b[sortConfig.key]) {
				return sortConfig.direction === 'ascending' ? -1 : 1;
			}
			if (a[sortConfig.key] > b[sortConfig.key]) {
				return sortConfig.direction === 'ascending' ? 1 : -1;
			}
			return 0;
		});

	// Apply sorting to the store data
	const sortedStores = React.useMemo(() => {
		const sortableStores = [...stores];
		if (sortConfig.key) {
			sortableStores.sort((a, b) => {
				const aValue = a[sortConfig.key];
				const bValue = b[sortConfig.key];

				if (aValue < bValue) {
					return sortConfig.direction === 'ascending' ? -1 : 1;
				}
				if (aValue > bValue) {
					return sortConfig.direction === 'ascending' ? 1 : -1;
				}
				return 0;
			});
		}
		return sortableStores;
	}, [stores, sortConfig]);

	return (
		<div className='layout'>
			<div
				className={`sidebar ${showSidebar ? 'expanded' : ''}`}
				onMouseEnter={() => setShowSidebar(true)}
				onMouseLeave={() => setShowSidebar(false)}
			>
				<div className='sidebar-header'>
					<h1 className='sidebar-title'>{showSidebar ? 'INBS' : 'IB'}</h1>
				</div>

				<div className='sidebar-buttons'>
					<button className='sidebar-button' onClick={handleStore}>
						<span
							className='sidebar-button-icon'
							style={{ marginRight: '12px', marginLeft: '-12px', fontSize: '20px' }}
						>
							📊
						</span>
						{showSidebar && 'Store'}
					</button>
					<button className='sidebar-button' onClick={handleAccessory}>
						<span
							className='sidebar-button-icon'
							style={{ marginRight: '12px', marginLeft: '-12px', fontSize: '20px' }}
						>
							A
						</span>
						{showSidebar && 'Accessory'}
					</button>
					<button className='sidebar-button' onClick={handleArtist}>
						<span
							className='sidebar-button-icon'
							style={{ marginRight: '12px', marginLeft: '-12px', fontSize: '20px' }}
						>
							🎨
						</span>
						{showSidebar && 'Artist'}
					</button>
					<button className='sidebar-button' onClick={handleWaitlist}>
						<span
							className='sidebar-button-icon'
							style={{ marginRight: '12px', marginLeft: '-12px', fontSize: '20px' }}
						>
							⏳
						</span>
						{showSidebar && 'Waitlist'}
					</button>
					<button className='sidebar-button' onClick={handleLogout}>
						<span
							className='sidebar-button-icon'
							style={{ marginRight: '12px', marginLeft: '-12px', fontSize: '20px' }}
						>
							⬅️
						</span>
						{showSidebar && 'Logout'}
					</button>
				</div>
			</div>

			<div className={`main-content ${showSidebar ? 'sidebar-expanded' : ''}`}>
				<div className='home-container' style={{ padding: '20px 40px' }}>
					<div
						style={{
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
							marginBottom: '25px',
							background: 'rgba(255,255,255,0.98)',
							padding: '25px 30px',
							boxShadow: '0 12px 35px rgba(0,0,0,0.1)',
							backdropFilter: 'blur(15px)',
							border: '1px solid rgba(255,255,255,0.3)',
							borderRadius: '20px',
						}}
					>
						<h1
							style={{
								color: '#1e3c72',
								fontSize: '36px',
								fontWeight: '800',
								margin: 0,
								textShadow: '2px 2px 4px rgba(0,0,0,0.12)',
								letterSpacing: '0.5px',
							}}
						>
							Store Management
						</h1>
						<button
							onClick={() => {
								setShowAddStoreForm((prev) => !prev);
								if (editMode) {
									setEditMode(false);
									setEditStoreId(null);
									setNewStoreData({
										address: '',
										description: '',
										imageUrl: '',
										status: 1,
									});
									setSelectedFile(null);
								}
							}}
							style={{
								background: 'linear-gradient(135deg, #24BFDD 0%, #1e3c72 100%)',
								color: 'white',
								border: 'none',
								borderRadius: '12px',
								padding: '12px 25px',
								fontSize: '16px',
								fontWeight: '600',
								cursor: 'pointer',
								display: 'flex',
								alignItems: 'center',
								gap: '10px',
								boxShadow: '0 10px 20px rgba(30, 60, 114, 0.2)',
								transition: 'all 0.3s ease',
							}}
							onMouseOver={(e) => {
								e.currentTarget.style.transform = 'translateY(-3px)';
								e.currentTarget.style.boxShadow = '0 15px 25px rgba(30, 60, 114, 0.3)';
							}}
							onMouseOut={(e) => {
								e.currentTarget.style.transform = 'translateY(0)';
								e.currentTarget.style.boxShadow = '0 10px 20px rgba(30, 60, 114, 0.2)';
							}}
						>
							{!showAddStoreForm && !editMode ? 'Add New Store' : 'Cancel'}
							{!showAddStoreForm && !editMode && (
								<span style={{ fontSize: '20px', marginLeft: '5px' }}>+</span>
							)}
						</button>
					</div>

					{/* Add Store Form */}
					{showAddStoreForm && (
						<div
							style={{
								background: 'rgba(255,255,255,0.98)',
								padding: '30px',
								borderRadius: '20px',
								marginBottom: '20px',
								boxShadow: '0 12px 35px rgba(0,0,0,0.1)',
								border: '1px solid rgba(255,255,255,0.3)',
							}}
						>
							<h2
								style={{
									color: '#1e3c72',
									fontSize: '26px',
									marginBottom: '25px',
									borderBottom: '4px solid #24BFDD',
									paddingBottom: '15px',
									display: 'inline-block',
									fontWeight: '700',
								}}
							>
								{editMode ? 'Update Store' : 'Create New Store'}
							</h2>

							<form onSubmit={handleSubmitNewStore}>
								<div
									style={{
										display: 'grid',
										gridTemplateColumns: '1fr 1fr',
										gap: '25px',
										marginBottom: '25px',
									}}
								>
									<div>
										<label
											htmlFor='address'
											style={{
												display: 'block',
												marginBottom: '10px',
												fontWeight: '600',
												color: '#1e3c72',
												fontSize: '16px',
											}}
										>
											Store Address *
										</label>
										<input
											type='text'
											id='address'
											name='address'
											value={newStoreData.address}
											onChange={handleStoreInputChange}
											required
											style={{
												width: '100%',
												padding: '12px 18px',
												borderRadius: '12px',
												border: '2px solid #eee',
												fontSize: '15px',
												transition: 'all 0.3s ease',
												outline: 'none',
											}}
											onFocus={(e) => {
												e.target.style.borderColor = '#24BFDD';
												e.target.style.boxShadow = '0 0 0 3px rgba(36,191,221,0.2)';
											}}
											onBlur={(e) => {
												e.target.style.borderColor = '#eee';
												e.target.style.boxShadow = 'none';
											}}
										/>
									</div>

									<div>
										<label
											htmlFor='status'
											style={{
												display: 'block',
												marginBottom: '10px',
												fontWeight: '600',
												color: '#1e3c72',
												fontSize: '16px',
											}}
										>
											Status
										</label>
										<select
											id='status'
											name='status'
											value={newStoreData.status}
											onChange={handleStoreInputChange}
											style={{
												width: '100%',
												padding: '12px 18px',
												borderRadius: '12px',
												border: '2px solid #eee',
												fontSize: '15px',
												transition: 'all 0.3s ease',
												outline: 'none',
												cursor: 'pointer',
											}}
											onFocus={(e) => {
												e.target.style.borderColor = '#24BFDD';
												e.target.style.boxShadow = '0 0 0 3px rgba(36,191,221,0.2)';
											}}
											onBlur={(e) => {
												e.target.style.borderColor = '#eee';
												e.target.style.boxShadow = 'none';
											}}
										>
											<option value={1}>Active</option>
											<option value={0}>Inactive</option>
										</select>
									</div>

									<div style={{ gridColumn: '1 / -1' }}>
										<label
											htmlFor='description'
											style={{
												display: 'block',
												marginBottom: '10px',
												fontWeight: '600',
												color: '#1e3c72',
												fontSize: '16px',
											}}
										>
											Description *
										</label>
										<textarea
											id='description'
											name='description'
											value={newStoreData.description}
											onChange={handleStoreInputChange}
											required
											rows={4}
											style={{
												width: '100%',
												padding: '12px 18px',
												borderRadius: '12px',
												border: '2px solid #eee',
												fontSize: '15px',
												transition: 'all 0.3s ease',
												outline: 'none',
												fontFamily: 'inherit',
												resize: 'vertical',
											}}
											onFocus={(e) => {
												e.target.style.borderColor = '#24BFDD';
												e.target.style.boxShadow = '0 0 0 3px rgba(36,191,221,0.2)';
											}}
											onBlur={(e) => {
												e.target.style.borderColor = '#eee';
												e.target.style.boxShadow = 'none';
											}}
										/>
									</div>

									<div>
										<label
											htmlFor='imageUrl'
											style={{
												display: 'block',
												marginBottom: '10px',
												fontWeight: '600',
												color: '#1e3c72',
												fontSize: '16px',
											}}
										>
											Image URL (Optional)
										</label>
										<input
											type='url'
											id='imageUrl'
											name='imageUrl'
											value={newStoreData.imageUrl}
											onChange={handleStoreInputChange}
											placeholder='https://example.com/image.jpg'
											style={{
												width: '100%',
												padding: '12px 18px',
												borderRadius: '12px',
												border: '2px solid #eee',
												fontSize: '15px',
												transition: 'all 0.3s ease',
												outline: 'none',
											}}
											onFocus={(e) => {
												e.target.style.borderColor = '#24BFDD';
												e.target.style.boxShadow = '0 0 0 3px rgba(36,191,221,0.2)';
											}}
											onBlur={(e) => {
												e.target.style.borderColor = '#eee';
												e.target.style.boxShadow = 'none';
											}}
										/>
									</div>

									<div>
										<label
											htmlFor='newImage'
											style={{
												display: 'block',
												marginBottom: '10px',
												fontWeight: '600',
												color: '#1e3c72',
												fontSize: '16px',
											}}
										>
											Upload Image (Optional)
										</label>
										<input
											type='file'
											id='newImage'
											name='newImage'
											accept='image/*'
											onChange={handleFileChange}
											style={{
												width: '100%',
												padding: '12px 18px',
												borderRadius: '12px',
												border: '2px solid #eee',
												fontSize: '15px',
												transition: 'all 0.3s ease',
												outline: 'none',
											}}
											onFocus={(e) => {
												e.target.style.borderColor = '#24BFDD';
												e.target.style.boxShadow = '0 0 0 3px rgba(36,191,221,0.2)';
											}}
											onBlur={(e) => {
												e.target.style.borderColor = '#eee';
												e.target.style.boxShadow = 'none';
											}}
										/>
									</div>
								</div>

								{submitMessage.text && (
									<div
										style={{
											padding: '12px 20px',
											borderRadius: '10px',
											marginBottom: '20px',
											background:
												submitMessage.type === 'success'
													? 'rgba(46, 204, 113, 0.15)'
													: 'rgba(231, 76, 60, 0.15)',
											color: submitMessage.type === 'success' ? '#27ae60' : '#e74c3c',
											fontWeight: '600',
											display: 'flex',
											alignItems: 'center',
											gap: '10px',
										}}
									>
										<span style={{ fontSize: '20px' }}>
											{submitMessage.type === 'success' ? '✓' : '✕'}
										</span>
										{submitMessage.text}
									</div>
								)}

								<div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
									<button
										type='button'
										onClick={() => {
											setShowAddStoreForm(false);
											setNewStoreData({
												address: '',
												description: '',
												imageUrl: '',
												status: 1,
											});
											setSelectedFile(null);
											setSubmitMessage({ type: '', text: '' });
											setEditMode(false);
											setEditStoreId(null);
										}}
										style={{
											padding: '12px 20px',
											borderRadius: '12px',
											border: '2px solid #eee',
											background: 'white',
											color: '#1e3c72',
											fontWeight: '600',
											fontSize: '15px',
											cursor: 'pointer',
											transition: 'all 0.3s ease',
										}}
										onMouseOver={(e) => {
											e.currentTarget.style.borderColor = '#24BFDD';
											e.currentTarget.style.backgroundColor = 'rgba(36, 191, 221, 0.05)';
										}}
										onMouseOut={(e) => {
											e.currentTarget.style.borderColor = '#eee';
											e.currentTarget.style.backgroundColor = 'white';
										}}
									>
										Cancel
									</button>
									<button
										type='submit'
										disabled={isSubmitting}
										style={{
											padding: '12px 25px',
											borderRadius: '12px',
											border: 'none',
											background: 'linear-gradient(135deg, #24BFDD 0%, #1e3c72 100%)',
											color: 'white',
											fontWeight: '600',
											fontSize: '15px',
											cursor: isSubmitting ? 'wait' : 'pointer',
											opacity: isSubmitting ? 0.8 : 1,
											transition: 'all 0.3s ease',
											boxShadow: '0 10px 20px rgba(30, 60, 114, 0.2)',
											display: 'flex',
											alignItems: 'center',
											gap: '10px',
										}}
										onMouseOver={(e) => {
											if (!isSubmitting) {
												e.currentTarget.style.transform = 'translateY(-3px)';
												e.currentTarget.style.boxShadow = '0 15px 25px rgba(30, 60, 114, 0.3)';
											}
										}}
										onMouseOut={(e) => {
											e.currentTarget.style.transform = 'translateY(0)';
											e.currentTarget.style.boxShadow = '0 10px 20px rgba(30, 60, 114, 0.2)';
										}}
									>
										{isSubmitting
											? editMode
												? 'Updating...'
												: 'Creating...'
											: editMode
											? 'Update Store'
											: 'Create Store'}
										{isSubmitting && (
											<span
												style={{
													display: 'inline-block',
													width: '18px',
													height: '18px',
													border: '3px solid rgba(255,255,255,0.3)',
													borderRadius: '50%',
													borderTopColor: 'white',
													animation: 'spin 1s linear infinite',
												}}
											/>
										)}
									</button>
								</div>
							</form>
						</div>
					)}

					{/* Add Month Filter */}
					<div
						style={{
							background: 'rgba(255,255,255,0.98)',
							padding: '20px',
							borderRadius: '20px',
							marginBottom: '20px',
							boxShadow: '0 12px 35px rgba(0,0,0,0.1)',
							border: '1px solid rgba(255,255,255,0.3)',
						}}
					>
						<div
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: '15px',
							}}
						>
							<label
								style={{
									color: '#1e3c72',
									fontWeight: '600',
									fontSize: '16px',
								}}
							>
								Filter by Month:
							</label>
							<select
								value={selectedMonth}
								onChange={(e) => setSelectedMonth(e.target.value)}
								style={{
									padding: '10px 15px',
									borderRadius: '10px',
									border: '2px solid #eee',
									fontSize: '14px',
									fontWeight: '500',
									color: '#1e3c72',
									cursor: 'pointer',
									transition: 'all 0.3s ease',
									outline: 'none',
								}}
								onFocus={(e) => {
									e.target.style.borderColor = '#24BFDD';
									e.target.style.boxShadow = '0 0 0 3px rgba(36,191,221,0.2)';
								}}
								onBlur={(e) => {
									e.target.style.borderColor = '#eee';
									e.target.style.boxShadow = 'none';
								}}
							>
								<option value='all'>All Months</option>
								<option value='1'>January</option>
								<option value='2'>February</option>
								<option value='3'>March</option>
								<option value='4'>April</option>
								<option value='5'>May</option>
								<option value='6'>June</option>
								<option value='7'>July</option>
								<option value='8'>August</option>
								<option value='9'>September</option>
								<option value='10'>October</option>
								<option value='11'>November</option>
								<option value='12'>December</option>
							</select>
						</div>
					</div>

					{/* Analytics Section */}
					<div
						style={{
							display: 'grid',
							gridTemplateColumns: '1fr 1fr',
							gap: '20px',
							marginBottom: '20px',
						}}
					>
						{/* Service Distribution Chart */}
						<div
							style={{
								background: 'rgba(255,255,255,0.98)',
								padding: '25px',
								borderRadius: '20px',
								boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
								border: '1px solid rgba(255,255,255,0.3)',
								transition: 'transform 0.3s ease, box-shadow 0.3s ease',
								height: '100%',
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.transform = 'translateY(-5px)';
								e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.transform = 'translateY(0)';
								e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.1)';
							}}
						>
							<h2
								style={{
									color: '#1e3c72',
									marginBottom: '25px',
									fontSize: '26px',
									fontWeight: '700',
									letterSpacing: '0.5px',
									borderBottom: '4px solid #24BFDD',
									paddingBottom: '15px',
									display: 'inline-block',
								}}
							>
								Revenue by Store
							</h2>
							<div
								style={{
									display: 'flex',
									justifyContent: 'center',
									alignItems: 'center',
									padding: '25px',
								}}
							>
								<BarChart
									width={500}
									height={400}
									data={getRevenueData()}
									margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
								>
									<CartesianGrid strokeDasharray='3 3' stroke='rgba(0,0,0,0.1)' />
									<XAxis
										dataKey='name'
										tick={{ fill: '#1e3c72', fontSize: 12 }}
										tickLine={{ stroke: '#1e3c72' }}
									/>
									<YAxis tick={{ fill: '#1e3c72', fontSize: 12 }} tickLine={{ stroke: '#1e3c72' }} />
									<Tooltip
										contentStyle={{
											background: 'rgba(255,255,255,0.95)',
											border: '1px solid #24BFDD',
											borderRadius: '8px',
											boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
										}}
									/>
									<Bar dataKey='value' fill='#24BFDD' radius={[8, 8, 0, 0]} barSize={35}>
										{getRevenueData().map((entry, index) => (
											<Cell
												key={`cell-${index}`}
												fill={`rgba(36,191,221,${0.5 + index * 0.1})`}
											/>
										))}
									</Bar>
								</BarChart>
							</div>
						</div>
						<div
							style={{
								background: 'rgba(255,255,255,0.98)',
								padding: '25px',
								borderRadius: '20px',
								boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
								border: '1px solid rgba(255,255,255,0.3)',
								transition: 'transform 0.3s ease, box-shadow 0.3s ease',
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.transform = 'translateY(-5px)';
								e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.transform = 'translateY(0)';
								e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.1)';
							}}
						>
							<h2
								style={{
									color: '#1e3c72',
									marginBottom: '25px',
									fontSize: '26px',
									fontWeight: '700',
									letterSpacing: '0.5px',
									borderBottom: '4px solid #24BFDD',
									paddingBottom: '15px',
									display: 'inline-block',
								}}
							>
								Service Distribution
							</h2>
							<div
								style={{
									display: 'flex',
									justifyContent: 'center',
									alignItems: 'center',
									padding: '25px',
									position: 'relative',
								}}
							>
								<PieChart width={500} height={400}>
									<Pie
										data={getPieChartData()}
										cx={250}
										cy={180}
										innerRadius={100}
										outerRadius={140}
										fill='#8884d8'
										paddingAngle={8}
										dataKey='value'
										label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
										labelLine={false}
										labelStyle={{
											fill: '#fff',
											fontSize: '16px',
											fontWeight: 'bold',
											textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
										}}
									>
										{getPieChartData().map((entry, index) => (
											<Cell
												key={`cell-${index}`}
												fill={`rgba(36, 191, 221, ${1 - index * 0.15})`}
												stroke='#fff'
												strokeWidth={4}
												style={{
													filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.2))',
													cursor: 'pointer',
													transition: 'all 0.3s ease',
												}}
											/>
										))}
									</Pie>
									<Tooltip
										contentStyle={{
											background: 'rgba(255, 255, 255, 0.98)',
											border: 'none',
											borderRadius: '12px',
											boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
											padding: '12px 18px',
										}}
										itemStyle={{
											color: '#1e3c72',
											fontSize: '14px',
											fontWeight: '600',
											textTransform: 'capitalize',
										}}
									/>
									<Legend
										verticalAlign='bottom'
										height={50}
										iconType='circle'
										iconSize={12}
										layout='horizontal'
										formatter={(value, entry) => (
											<span
												style={{
													color: '#1e3c72',
													fontSize: '15px',
													fontWeight: '600',
													padding: '6px 12px',
													borderRadius: '20px',
													background: 'rgba(36, 191, 221, 0.1)',
													transition: 'all 0.3s ease',
													display: 'inline-block',
													margin: '0 4px',
												}}
											>
												{value}
											</span>
										)}
										wrapperStyle={{
											padding: '20px 0',
										}}
									/>
								</PieChart>
							</div>
						</div>

						{/* Price Distribution Chart */}
						<div
							style={{
								background: 'rgba(255,255,255,0.98)',
								padding: '25px',
								borderRadius: '20px',
								boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
								border: '1px solid rgba(255,255,255,0.3)',
								transition: 'transform 0.3s ease, box-shadow 0.3s ease',
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.transform = 'translateY(-5px)';
								e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.transform = 'translateY(0)';
								e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.1)';
							}}
						>
							<h2
								style={{
									color: '#1e3c72',
									marginBottom: '25px',
									fontSize: '26px',
									fontWeight: '700',
									letterSpacing: '0.5px',
									borderBottom: '4px solid #24BFDD',
									paddingBottom: '15px',
									display: 'inline-block',
								}}
							>
								Price Distribution
							</h2>
							<div
								style={{
									display: 'flex',
									justifyContent: 'center',
									alignItems: 'center',
									padding: '25px',
								}}
							>
								<BarChart width={500} height={400} data={getPriceChartData()}>
									<CartesianGrid strokeDasharray='3 3' stroke='rgba(0,0,0,0.1)' />
									<XAxis
										dataKey='range'
										tick={{
											fill: '#1e3c72',
											fontSize: 12,
											fontWeight: 600,
										}}
										tickLine={{ stroke: '#1e3c72' }}
									/>
									<YAxis
										tick={{
											fill: '#1e3c72',
											fontSize: 12,
											fontWeight: 600,
										}}
										tickLine={{ stroke: '#1e3c72' }}
									/>
									<Tooltip
										contentStyle={{
											background: 'rgba(255,255,255,0.98)',
											border: 'none',
											borderRadius: '12px',
											boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
											padding: '12px 18px',
										}}
										itemStyle={{
											color: '#1e3c72',
											fontSize: '14px',
											fontWeight: '600',
											textTransform: 'capitalize',
										}}
										cursor={{ fill: 'rgba(36, 191, 221, 0.1)' }}
									/>
									<Bar dataKey='count' radius={[8, 8, 0, 0]} barSize={35}>
										{getPriceChartData().map((entry, index) => (
											<Cell
												key={`cell-${index}`}
												fill={`rgba(36, 191, 221, ${0.7 + index * 0.1})`}
												stroke='rgba(255,255,255,0.8)'
												strokeWidth={1}
												style={{
													filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.1))',
													cursor: 'pointer',
													transition: 'all 0.3s ease',
												}}
											/>
										))}
									</Bar>
									<Legend
										verticalAlign='top'
										height={36}
										iconType='circle'
										iconSize={10}
										formatter={(value) => (
											<span
												style={{
													color: '#1e3c72',
													fontSize: '14px',
													fontWeight: '600',
													padding: '6px 12px',
													borderRadius: '20px',
													background: 'rgba(36, 191, 221, 0.1)',
													transition: 'all 0.3s ease',
												}}
											>
												Price Distribution
											</span>
										)}
									/>
								</BarChart>
							</div>
						</div>
					</div>

					{/* Search and Filter Controls */}
					<div
						style={{
							background: 'rgba(255,255,255,0.98)',
							padding: '25px',
							borderRadius: '20px',
							marginBottom: '25px',
							display: 'flex',
							gap: '25px',
							alignItems: 'center',
							flexWrap: 'wrap',
							boxShadow: '0 12px 35px rgba(0,0,0,0.1)',
							border: '1px solid rgba(255,255,255,0.3)',
						}}
					>
						<input
							type='text'
							placeholder='Search anything...'
							value={searchTerm}
							onChange={handleSearch}
							style={{
								padding: '12px 18px',
								borderRadius: '12px',
								border: '2px solid #eee',
								width: '280px',
								fontSize: '15px',
								transition: 'all 0.3s ease',
								outline: 'none',
							}}
							onFocus={(e) => {
								e.target.style.borderColor = '#24BFDD';
								e.target.style.boxShadow = '0 0 0 3px rgba(36,191,221,0.2)';
							}}
							onBlur={(e) => {
								e.target.style.borderColor = '#eee';
								e.target.style.boxShadow = 'none';
							}}
						/>

						<select
							name='service'
							value={filters.service}
							onChange={handleFilterChange}
							style={{
								padding: '12px 18px',
								borderRadius: '12px',
								border: '2px solid #eee',
								fontSize: '15px',
								cursor: 'pointer',
								transition: 'all 0.3s ease',
								outline: 'none',
							}}
							onFocus={(e) => {
								e.target.style.borderColor = '#24BFDD';
								e.target.style.boxShadow = '0 0 0 3px rgba(36,191,221,0.2)';
							}}
							onBlur={(e) => {
								e.target.style.borderColor = '#eee';
								e.target.style.boxShadow = 'none';
							}}
						>
							<option value=''>All Services</option>
							{getUniqueValues('service').map((service) => (
								<option key={service} value={service}>
									{service}
								</option>
							))}
						</select>

						<select
							name='store'
							value={filters.store}
							onChange={handleFilterChange}
							style={{
								padding: '12px 18px',
								borderRadius: '12px',
								border: '2px solid #eee',
								fontSize: '15px',
								cursor: 'pointer',
								transition: 'all 0.3s ease',
								outline: 'none',
							}}
							onFocus={(e) => {
								e.target.style.borderColor = '#24BFDD';
								e.target.style.boxShadow = '0 0 0 3px rgba(36,191,221,0.2)';
							}}
							onBlur={(e) => {
								e.target.style.borderColor = '#eee';
								e.target.style.boxShadow = 'none';
							}}
						>
							<option value=''>All Stores</option>
							{getUniqueValues('store').map((store) => (
								<option key={store} value={store}>
									{store}
								</option>
							))}
						</select>

						<select
							name='price'
							value={filters.price}
							onChange={handleFilterChange}
							style={{
								padding: '12px 18px',
								borderRadius: '12px',
								border: '2px solid #eee',
								fontSize: '15px',
								cursor: 'pointer',
								transition: 'all 0.3s ease',
								outline: 'none',
							}}
							onFocus={(e) => {
								e.target.style.borderColor = '#24BFDD';
								e.target.style.boxShadow = '0 0 0 3px rgba(36,191,221,0.2)';
							}}
							onBlur={(e) => {
								e.target.style.borderColor = '#eee';
								e.target.style.boxShadow = 'none';
							}}
						>
							<option value=''>All Prices</option>
							{getUniqueValues('price')
								.sort((a, b) => Number(a) - Number(b))
								.map((price) => (
									<option key={price} value={price}>
										{price}
									</option>
								))}
						</select>
					</div>

					<div
						className='store-list'
						style={{
							background: 'rgba(255,255,255,0.98)',
							padding: '30px',
							borderRadius: '25px',
							boxShadow: '0 18px 45px rgba(0,0,0,0.1)',
							backdropFilter: 'blur(15px)',
							border: '1px solid rgba(255,255,255,0.3)',
							marginBottom: '30px',
						}}
					>
						<h2
							style={{
								color: '#1e3c72',
								fontSize: '32px',
								marginBottom: '35px',
								borderBottom: '4px solid #24BFDD',
								paddingBottom: '15px',
								display: 'inline-block',
								fontWeight: '800',
								letterSpacing: '0.5px',
							}}
						>
							Store List
						</h2>

						{stores.length === 0 ? (
							<div
								style={{
									display: 'flex',
									justifyContent: 'center',
									padding: '40px 0',
									color: '#666',
									fontSize: '18px',
								}}
							>
								{searchTerm ? 'No stores match your search' : 'Loading store data...'}
							</div>
						) : (
							<table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 15px' }}>
								<thead>
									<tr style={{ background: 'rgba(248,249,250,0.9)' }}>
										<th
											onClick={() => requestSort('address')}
											style={{
												padding: '20px',
												color: '#1e3c72',
												fontWeight: '800',
												borderBottom: '2px solid #e9ecef',
												fontSize: '16px',
												cursor: 'pointer',
												transition: 'all 0.3s ease',
											}}
											onMouseOver={(e) => {
												e.currentTarget.style.color = '#24BFDD';
											}}
											onMouseOut={(e) => {
												e.currentTarget.style.color = '#1e3c72';
											}}
										>
											Store Address{' '}
											{sortConfig.key === 'address' &&
												(sortConfig.direction === 'ascending' ? '↑' : '↓')}
										</th>
										<th
											style={{
												padding: '20px',
												color: '#1e3c72',
												fontWeight: '800',
												borderBottom: '2px solid #e9ecef',
												fontSize: '16px',
											}}
										>
											Description
										</th>
										<th
											onClick={() => requestSort('status')}
											style={{
												padding: '20px',
												color: '#1e3c72',
												fontWeight: '800',
												borderBottom: '2px solid #e9ecef',
												fontSize: '16px',
												cursor: 'pointer',
												transition: 'all 0.3s ease',
											}}
											onMouseOver={(e) => {
												e.currentTarget.style.color = '#24BFDD';
											}}
											onMouseOut={(e) => {
												e.currentTarget.style.color = '#1e3c72';
											}}
										>
											Status{' '}
											{sortConfig.key === 'status' &&
												(sortConfig.direction === 'ascending' ? '↑' : '↓')}
										</th>
										<th
											onClick={() => requestSort('averageRating')}
											style={{
												padding: '20px',
												color: '#1e3c72',
												fontWeight: '800',
												borderBottom: '2px solid #e9ecef',
												fontSize: '16px',
												cursor: 'pointer',
												transition: 'all 0.3s ease',
											}}
											onMouseOver={(e) => {
												e.currentTarget.style.color = '#24BFDD';
											}}
											onMouseOut={(e) => {
												e.currentTarget.style.color = '#1e3c72';
											}}
										>
											Rating{' '}
											{sortConfig.key === 'averageRating' &&
												(sortConfig.direction === 'ascending' ? '↑' : '↓')}
										</th>
										<th
											onClick={() => requestSort('createdAt')}
											style={{
												padding: '20px',
												color: '#1e3c72',
												fontWeight: '800',
												borderBottom: '2px solid #e9ecef',
												fontSize: '16px',
												cursor: 'pointer',
												transition: 'all 0.3s ease',
											}}
											onMouseOver={(e) => {
												e.currentTarget.style.color = '#24BFDD';
											}}
											onMouseOut={(e) => {
												e.currentTarget.style.color = '#1e3c72';
											}}
										>
											Created Date{' '}
											{sortConfig.key === 'createdAt' &&
												(sortConfig.direction === 'ascending' ? '↑' : '↓')}
										</th>
										<th
											style={{
												padding: '20px',
												color: '#1e3c72',
												fontWeight: '800',
												borderBottom: '2px solid #e9ecef',
												fontSize: '16px',
											}}
										>
											Artists
										</th>
										<th
											style={{
												padding: '20px',
												color: '#1e3c72',
												fontWeight: '800',
												borderBottom: '2px solid #e9ecef',
												fontSize: '16px',
											}}
										>
											Store Image
										</th>
										<th
											style={{
												padding: '20px',
												color: '#1e3c72',
												fontWeight: '800',
												borderBottom: '2px solid #e9ecef',
												fontSize: '16px',
											}}
										>
											Actions
										</th>
									</tr>
								</thead>
								<tbody>
									{sortedStores.map((store, index) => (
										<tr
											key={store.id}
											onClick={() => setSelectedStore(store)}
											style={{
												background: 'white',
												transition: 'all 0.4s ease',
												borderRadius: '18px',
												boxShadow: '0 5px 18px rgba(0,0,0,0.04)',
												cursor: 'pointer',
											}}
											onMouseOver={(e) => {
												e.currentTarget.style.transform = 'translateY(-4px)';
												e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.12)';
											}}
											onMouseOut={(e) => {
												e.currentTarget.style.transform = 'translateY(0)';
												e.currentTarget.style.boxShadow = '0 5px 18px rgba(0,0,0,0.04)';
											}}
										>
											<td
												style={{
													padding: '25px',
													borderBottom: '1px solid #e9ecef',
													fontWeight: '600',
													color: '#1e3c72',
												}}
											>
												{store.address}
											</td>
											<td
												style={{
													padding: '25px',
													borderBottom: '1px solid #e9ecef',
													color: '#666',
													fontWeight: '500',
												}}
											>
												{store.description}
											</td>
											<td
												style={{
													padding: '25px',
													borderBottom: '1px solid #e9ecef',
													color: '#666',
													fontWeight: '500',
												}}
											>
												<span
													style={{
														padding: '6px 12px',
														borderRadius: '20px',
														background:
															store.status === '1'
																? 'rgba(75, 192, 192, 0.2)'
																: 'rgba(255, 99, 132, 0.2)',
														color: store.status === '1' ? '#2a9d8f' : '#e63946',
														fontWeight: '600',
													}}
												>
													{store.status === '1' ? 'Active' : 'Inactive'}
												</span>
											</td>
											<td
												style={{
													padding: '25px',
													borderBottom: '1px solid #e9ecef',
													fontWeight: '600',
													color: '#1e3c72',
												}}
											>
												{store.averageRating > 0
													? store.averageRating.toFixed(1)
													: 'No ratings'}
											</td>
											<td
												style={{
													padding: '25px',
													borderBottom: '1px solid #e9ecef',
													fontWeight: '500',
													color: '#666',
												}}
											>
												{formatDate(store.createdAt)}
											</td>
											<td
												style={{
													padding: '25px',
													borderBottom: '1px solid #e9ecef',
													fontWeight: '500',
													color: '#666',
												}}
											>
												{store.artistStores && store.artistStores.length > 0 ? (
													<div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
														{store.artistStores.map((artistStore, idx) => (
															<span
																key={idx}
																style={{
																	padding: '6px 12px',
																	borderRadius: '20px',
																	background: 'rgba(36, 191, 221, 0.1)',
																	color: '#24BFDD',
																	fontWeight: '600',
																	fontSize: '14px',
																}}
															>
																{artistStore.artist?.user?.fullName || 'Unknown Artist'}
															</span>
														))}
													</div>
												) : (
													<span style={{ color: '#999' }}>No artists assigned</span>
												)}
											</td>
											<td style={{ padding: '25px', borderBottom: '1px solid #e9ecef' }}>
												<div>
													<img
														src={store.imageUrl}
														alt={`${store.address} store`}
														style={{
															width: '130px',
															height: '130px',
															objectFit: 'cover',
															borderRadius: '18px',
															boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
															transition: 'all 0.4s ease',
															border: '3px solid rgba(255,255,255,0.3)',
														}}
														onMouseOver={(e) => {
															e.target.style.transform = 'scale(1.1)';
															e.target.style.boxShadow = '0 15px 35px rgba(0,0,0,0.18)';
														}}
														onMouseOut={(e) => {
															e.target.style.transform = 'scale(1)';
															e.target.style.boxShadow = '0 10px 25px rgba(0,0,0,0.12)';
														}}
													/>
												</div>
											</td>
											<td style={{ padding: '25px', borderBottom: '1px solid #e9ecef' }}>
												<div style={{ display: 'flex', gap: '10px' }}>
													<button
														onClick={(e) => {
															e.stopPropagation();
															handleEditStore(store);
														}}
														style={{
															padding: '8px 15px',
															borderRadius: '10px',
															border: 'none',
															background: 'rgba(36, 191, 221, 0.1)',
															color: '#24BFDD',
															fontWeight: '600',
															fontSize: '14px',
															cursor: 'pointer',
															transition: 'all 0.3s ease',
															display: 'flex',
															alignItems: 'center',
															gap: '5px',
														}}
														onMouseOver={(e) => {
															e.currentTarget.style.background =
																'rgba(36, 191, 221, 0.2)';
															e.currentTarget.style.transform = 'translateY(-2px)';
														}}
														onMouseOut={(e) => {
															e.currentTarget.style.background =
																'rgba(36, 191, 221, 0.1)';
															e.currentTarget.style.transform = 'translateY(0)';
														}}
													>
														<span style={{ fontSize: '16px' }}>✎</span> Edit
													</button>

													<button
														onClick={(e) => {
															e.stopPropagation();
															handleDeleteStore(store.id);
														}}
														style={{
															padding: '8px 15px',
															borderRadius: '10px',
															border: 'none',
															background: 'rgba(231, 76, 60, 0.1)',
															color: '#e74c3c',
															fontWeight: '600',
															fontSize: '14px',
															cursor: 'pointer',
															transition: 'all 0.3s ease',
															display: 'flex',
															alignItems: 'center',
															gap: '5px',
														}}
														onMouseOver={(e) => {
															e.currentTarget.style.background = 'rgba(231, 76, 60, 0.2)';
															e.currentTarget.style.transform = 'translateY(-2px)';
														}}
														onMouseOut={(e) => {
															e.currentTarget.style.background = 'rgba(231, 76, 60, 0.1)';
															e.currentTarget.style.transform = 'translateY(0)';
														}}
													>
														<span style={{ fontSize: '16px' }}>🗑</span> Delete
													</button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						)}
					</div>

					<div
						className='booking-list'
						style={{
							background: 'rgba(255,255,255,0.98)',
							padding: '30px',
							borderRadius: '25px',
							boxShadow: '0 18px 45px rgba(0,0,0,0.1)',
							backdropFilter: 'blur(15px)',
							border: '1px solid rgba(255,255,255,0.3)',
						}}
					>
						<h2
							style={{
								color: '#1e3c72',
								fontSize: '32px',
								marginBottom: '35px',
								borderBottom: '4px solid #24BFDD',
								paddingBottom: '15px',
								display: 'inline-block',
								fontWeight: '800',
								letterSpacing: '0.5px',
							}}
						>
							Appointment List
						</h2>
						<table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 15px' }}>
							<thead>
								<tr style={{ background: 'rgba(248,249,250,0.9)' }}>
									<th
										onClick={() => requestSort('name')}
										style={{
											padding: '20px',
											color: '#1e3c72',
											fontWeight: '800',
											borderBottom: '2px solid #e9ecef',
											fontSize: '16px',
											cursor: 'pointer',
											transition: 'all 0.3s ease',
										}}
										onMouseOver={(e) => {
											e.currentTarget.style.color = '#24BFDD';
										}}
										onMouseOut={(e) => {
											e.currentTarget.style.color = '#1e3c72';
										}}
									>
										Customer Name{' '}
										{sortConfig.key === 'name' &&
											(sortConfig.direction === 'ascending' ? '↑' : '↓')}
									</th>
									<th
										style={{
											padding: '20px',
											color: '#1e3c72',
											fontWeight: '800',
											borderBottom: '2px solid #e9ecef',
											fontSize: '16px',
										}}
									>
										Phone Number
									</th>
									<th
										onClick={() => requestSort('date')}
										style={{
											padding: '20px',
											color: '#1e3c72',
											fontWeight: '800',
											borderBottom: '2px solid #e9ecef',
											fontSize: '16px',
											cursor: 'pointer',
											transition: 'all 0.3s ease',
										}}
										onMouseOver={(e) => {
											e.currentTarget.style.color = '#24BFDD';
										}}
										onMouseOut={(e) => {
											e.currentTarget.style.color = '#1e3c72';
										}}
									>
										Date{' '}
										{sortConfig.key === 'date' &&
											(sortConfig.direction === 'ascending' ? '↑' : '↓')}
									</th>
									<th
										style={{
											padding: '20px',
											color: '#1e3c72',
											fontWeight: '800',
											borderBottom: '2px solid #e9ecef',
											fontSize: '16px',
										}}
									>
										Time
									</th>
									<th
										style={{
											padding: '20px',
											color: '#1e3c72',
											fontWeight: '800',
											borderBottom: '2px solid #e9ecef',
											fontSize: '16px',
										}}
									>
										Service
									</th>
									<th
										onClick={() => requestSort('price')}
										style={{
											padding: '20px',
											color: '#1e3c72',
											fontWeight: '800',
											borderBottom: '2px solid #e9ecef',
											fontSize: '16px',
											cursor: 'pointer',
											transition: 'all 0.3s ease',
										}}
										onMouseOver={(e) => {
											e.currentTarget.style.color = '#24BFDD';
										}}
										onMouseOut={(e) => {
											e.currentTarget.style.color = '#1e3c72';
										}}
									>
										Price{' '}
										{sortConfig.key === 'price' &&
											(sortConfig.direction === 'ascending' ? '↑' : '↓')}
									</th>
									<th
										style={{
											padding: '20px',
											color: '#1e3c72',
											fontWeight: '800',
											borderBottom: '2px solid #e9ecef',
											fontSize: '16px',
										}}
									>
										Store Address
									</th>
									<th
										style={{
											padding: '20px',
											color: '#1e3c72',
											fontWeight: '800',
											borderBottom: '2px solid #e9ecef',
											fontSize: '16px',
										}}
									>
										Service Image
									</th>
								</tr>
							</thead>
							<tbody>
								{filteredAndSortedBookings.map((booking, index) => (
									<tr
										key={index}
										style={{
											background: 'white',
											transition: 'all 0.4s ease',
											borderRadius: '18px',
											boxShadow: '0 5px 18px rgba(0,0,0,0.04)',
											cursor: 'pointer',
										}}
										onMouseOver={(e) => {
											e.currentTarget.style.transform = 'translateY(-4px)';
											e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.12)';
										}}
										onMouseOut={(e) => {
											e.currentTarget.style.transform = 'translateY(0)';
											e.currentTarget.style.boxShadow = '0 5px 18px rgba(0,0,0,0.04)';
										}}
									>
										<td
											style={{
												padding: '25px',
												borderBottom: '1px solid #e9ecef',
												fontWeight: '600',
												color: '#1e3c72',
											}}
										>
											{booking.name}
										</td>
										<td
											style={{
												padding: '25px',
												borderBottom: '1px solid #e9ecef',
												color: '#666',
												fontWeight: '500',
											}}
										>
											{booking.phone}
										</td>
										<td
											style={{
												padding: '25px',
												borderBottom: '1px solid #e9ecef',
												color: '#666',
												fontWeight: '500',
											}}
										>
											{booking.date}
										</td>
										<td
											style={{
												padding: '25px',
												borderBottom: '1px solid #e9ecef',
												color: '#666',
												fontWeight: '500',
											}}
										>
											{booking.time} hours
										</td>
										<td
											style={{
												padding: '25px',
												borderBottom: '1px solid #e9ecef',
												fontWeight: '600',
												color: '#1e3c72',
											}}
										>
											{booking.service}
										</td>
										<td
											style={{
												padding: '25px',
												borderBottom: '1px solid #e9ecef',
												fontWeight: '700',
												color: '#24BFDD',
											}}
										>
											${booking.price}
										</td>
										<td
											style={{
												padding: '25px',
												borderBottom: '1px solid #e9ecef',
												fontWeight: '600',
												color: '#24BFDD',
											}}
										>
											{booking.store}
										</td>
										<td style={{ padding: '25px', borderBottom: '1px solid #e9ecef' }}>
											{booking.serviceImage && (
												<div>
													<img
														src={booking.serviceImage}
														alt={booking.service}
														onClick={() => setSelectedImage(booking)}
														style={{
															width: '130px',
															height: '130px',
															objectFit: 'cover',
															borderRadius: '18px',
															boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
															transition: 'all 0.4s ease',
															border: '3px solid rgba(255,255,255,0.3)',
															cursor: 'pointer',
														}}
														onMouseOver={(e) => {
															e.target.style.transform = 'scale(1.1)';
															e.target.style.boxShadow = '0 15px 35px rgba(0,0,0,0.18)';
														}}
														onMouseOut={(e) => {
															e.target.style.transform = 'scale(1)';
															e.target.style.boxShadow = '0 10px 25px rgba(0,0,0,0.12)';
														}}
													/>
												</div>
											)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>

			{/* Image Modal */}
			{selectedImage && (
				<div
					style={{
						position: 'fixed',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						backgroundColor: 'rgba(0,0,0,0.9)',
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						zIndex: 1100,
						padding: '25px',
						backdropFilter: 'blur(10px)',
					}}
					onClick={() => setSelectedImage(null)}
				>
					<div
						style={{
							background: 'linear-gradient(145deg, #ffffff, #f8f9fa)',
							padding: '35px',
							borderRadius: '25px',
							maxWidth: '90%',
							maxHeight: '90%',
							overflow: 'auto',
							position: 'relative',
							boxShadow: '0 30px 60px -12px rgba(0,0,0,0.3)',
							border: '1px solid rgba(255,255,255,0.2)',
							animation: 'modalFadeIn 0.4s ease-out',
						}}
						onClick={(e) => e.stopPropagation()}
					>
						<img
							src={selectedImage.serviceImage}
							alt={selectedImage.service}
							style={{
								width: '100%',
								maxHeight: '75vh',
								objectFit: 'cover',
								borderRadius: '20px',
								marginBottom: '35px',
								boxShadow: '0 18px 40px rgba(0,0,0,0.25)',
								transition: 'all 0.4s ease',
								cursor: 'zoom-in',
								border: '3px solid rgba(255,255,255,0.3)',
							}}
							onMouseOver={(e) => {
								e.target.style.transform = 'scale(1.04)';
								e.target.style.boxShadow = '0 25px 50px rgba(0,0,0,0.3)';
							}}
							onMouseOut={(e) => {
								e.target.style.transform = 'scale(1)';
								e.target.style.boxShadow = '0 18px 40px rgba(0,0,0,0.25)';
							}}
						/>
						<div
							style={{
								textAlign: 'center',
								padding: '30px 35px',
								background: 'linear-gradient(135deg, #ffffff, #f8f9fa)',
								borderRadius: '18px',
								boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
								border: '1px solid rgba(255,255,255,0.5)',
							}}
						>
							<h3
								style={{
									color: '#005FA3',
									marginBottom: '25px',
									fontSize: '2.2rem',
									fontWeight: '800',
									textShadow: '2px 2px 4px rgba(0,0,0,0.12)',
									letterSpacing: '0.8px',
									marginBottom: '20px',
									fontSize: '2rem',
									fontWeight: '700',
									textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
									letterSpacing: '0.5px',
								}}
							>
								{selectedImage.service}
							</h3>
							<p
								style={{
									color: '#4a4a4a',
									margin: '12px 0',
									fontSize: '1.2rem',
									fontWeight: '500',
									display: 'flex',
									justifyContent: 'center',
									alignItems: 'center',
									gap: '8px',
								}}
							>
								Price:{' '}
								<span
									style={{
										color: '#00A5F5',
										background: 'rgba(0, 165, 245, 0.1)',
										padding: '4px 12px',
										borderRadius: '20px',
										fontWeight: '600',
									}}
								>
									${selectedImage.price}
								</span>
							</p>
							<p
								style={{
									color: '#4a4a4a',
									margin: '12px 0',
									fontSize: '1.2rem',
									fontWeight: '500',
									display: 'flex',
									justifyContent: 'center',
									alignItems: 'center',
									gap: '8px',
								}}
							>
								Duration:{' '}
								<span
									style={{
										color: '#24BFDD',
										background: 'rgba(36, 191, 221, 0.1)',
										padding: '4px 12px',
										borderRadius: '20px',
										fontWeight: '600',
									}}
								>
									{selectedImage.time} hours
								</span>
							</p>
							<p
								style={{
									color: '#4a4a4a',
									margin: '12px 0',
									fontSize: '1.2rem',
									fontWeight: '500',
									display: 'flex',
									justifyContent: 'center',
									alignItems: 'center',
									gap: '8px',
								}}
							>
								Store:{' '}
								<span
									style={{
										color: '#53CEF8',
										background: 'rgba(83, 206, 248, 0.1)',
										padding: '4px 12px',
										borderRadius: '20px',
										fontWeight: '600',
									}}
								>
									{selectedImage.store}
								</span>
							</p>
						</div>
					</div>
				</div>
			)}

			{/* Store Detail Modal */}
			{selectedStore && (
				<div
					style={{
						position: 'fixed',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						backgroundColor: 'rgba(0,0,0,0.9)',
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						zIndex: 1100,
						padding: '25px',
						backdropFilter: 'blur(10px)',
					}}
					onClick={() => setSelectedStore(null)}
				>
					<div
						style={{
							background: 'linear-gradient(145deg, #ffffff, #f8f9fa)',
							padding: '35px',
							borderRadius: '25px',
							maxWidth: '90%',
							maxHeight: '90%',
							overflow: 'auto',
							position: 'relative',
							boxShadow: '0 30px 60px -12px rgba(0,0,0,0.3)',
							border: '1px solid rgba(255,255,255,0.2)',
						}}
						onClick={(e) => e.stopPropagation()}
					>
						<div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
							<div style={{ flex: '0 0 300px' }}>
								<img
									src={selectedStore.imageUrl}
									alt={`${selectedStore.address} store`}
									style={{
										width: '100%',
										height: '300px',
										objectFit: 'cover',
										borderRadius: '20px',
										boxShadow: '0 18px 40px rgba(0,0,0,0.25)',
									}}
								/>
							</div>

							<div style={{ flex: '1 1 500px' }}>
								<h2
									style={{
										color: '#005FA3',
										marginBottom: '25px',
										fontSize: '2.2rem',
										fontWeight: '800',
										textShadow: '2px 2px 4px rgba(0,0,0,0.12)',
										letterSpacing: '0.8px',
									}}
								>
									{selectedStore.address}
								</h2>

								<div style={{ marginBottom: '20px' }}>
									<h3 style={{ color: '#1e3c72', marginBottom: '10px', fontSize: '1.3rem' }}>
										Description
									</h3>
									<p style={{ fontSize: '1.1rem', color: '#4a4a4a', lineHeight: '1.5' }}>
										{selectedStore.description}
									</p>
								</div>

								<div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap', marginBottom: '25px' }}>
									<div>
										<h3 style={{ color: '#1e3c72', marginBottom: '10px', fontSize: '1.3rem' }}>
											Status
										</h3>
										<p
											style={{
												display: 'inline-block',
												padding: '8px 16px',
												borderRadius: '20px',
												background:
													selectedStore.status === '1'
														? 'rgba(75, 192, 192, 0.2)'
														: 'rgba(255, 99, 132, 0.2)',
												color: selectedStore.status === '1' ? '#2a9d8f' : '#e63946',
												fontWeight: '600',
												fontSize: '1.1rem',
											}}
										>
											{selectedStore.status === '1' ? 'Active' : 'Inactive'}
										</p>
									</div>

									<div>
										<h3 style={{ color: '#1e3c72', marginBottom: '10px', fontSize: '1.3rem' }}>
											Rating
										</h3>
										<p
											style={{
												display: 'inline-block',
												padding: '8px 16px',
												borderRadius: '20px',
												background: 'rgba(255, 193, 7, 0.2)',
												color: '#ff9800',
												fontWeight: '600',
												fontSize: '1.1rem',
											}}
										>
											{selectedStore.averageRating > 0
												? `${selectedStore.averageRating.toFixed(1)} / 5`
												: 'No ratings'}
										</p>
									</div>

									<div>
										<h3 style={{ color: '#1e3c72', marginBottom: '10px', fontSize: '1.3rem' }}>
											Created
										</h3>
										<p
											style={{
												display: 'inline-block',
												padding: '8px 16px',
												borderRadius: '20px',
												background: 'rgba(36, 191, 221, 0.1)',
												color: '#24BFDD',
												fontWeight: '600',
												fontSize: '1.1rem',
											}}
										>
											{formatDate(selectedStore.createdAt)}
										</p>
									</div>

									<div style={{ marginLeft: 'auto' }}>
										<div style={{ display: 'flex', gap: '10px' }}>
											<button
												onClick={(e) => {
													e.stopPropagation();
													handleEditStore(selectedStore);
												}}
												style={{
													padding: '10px 20px',
													borderRadius: '12px',
													border: 'none',
													background: 'rgba(36, 191, 221, 0.1)',
													color: '#24BFDD',
													fontWeight: '600',
													fontSize: '15px',
													cursor: 'pointer',
													transition: 'all 0.3s ease',
													display: 'flex',
													alignItems: 'center',
													gap: '8px',
												}}
												onMouseOver={(e) => {
													e.currentTarget.style.background = 'rgba(36, 191, 221, 0.2)';
													e.currentTarget.style.transform = 'translateY(-2px)';
												}}
												onMouseOut={(e) => {
													e.currentTarget.style.background = 'rgba(36, 191, 221, 0.1)';
													e.currentTarget.style.transform = 'translateY(0)';
												}}
											>
												<span style={{ fontSize: '18px' }}>✎</span> Edit Store
											</button>

											<button
												onClick={(e) => {
													e.stopPropagation();
													setSelectedStore(null);
													handleDeleteStore(selectedStore.id);
												}}
												style={{
													padding: '10px 20px',
													borderRadius: '12px',
													border: 'none',
													background: 'rgba(231, 76, 60, 0.1)',
													color: '#e74c3c',
													fontWeight: '600',
													fontSize: '15px',
													cursor: 'pointer',
													transition: 'all 0.3s ease',
													display: 'flex',
													alignItems: 'center',
													gap: '8px',
												}}
												onMouseOver={(e) => {
													e.currentTarget.style.background = 'rgba(231, 76, 60, 0.2)';
													e.currentTarget.style.transform = 'translateY(-2px)';
												}}
												onMouseOut={(e) => {
													e.currentTarget.style.background = 'rgba(231, 76, 60, 0.1)';
													e.currentTarget.style.transform = 'translateY(0)';
												}}
											>
												<span style={{ fontSize: '18px' }}>🗑</span> Delete Store
											</button>
										</div>
									</div>
								</div>

								<div>
									<h3 style={{ color: '#1e3c72', marginBottom: '15px', fontSize: '1.3rem' }}>
										Assigned Artists
									</h3>
									{selectedStore.artistStores && selectedStore.artistStores.length > 0 ? (
										<div
											style={{
												display: 'flex',
												flexDirection: 'column',
												gap: '15px',
											}}
										>
											{selectedStore.artistStores.map((artistStore, idx) => (
												<div
													key={idx}
													style={{
														padding: '15px 20px',
														borderRadius: '15px',
														background: 'rgba(248, 249, 250, 0.8)',
														boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
														border: '1px solid rgba(0,0,0,0.05)',
													}}
												>
													<div
														style={{
															display: 'flex',
															alignItems: 'center',
															gap: '10px',
															marginBottom: '10px',
														}}
													>
														<div
															style={{
																width: '40px',
																height: '40px',
																borderRadius: '50%',
																background: '#24BFDD',
																display: 'flex',
																justifyContent: 'center',
																alignItems: 'center',
																color: 'white',
																fontWeight: 'bold',
																fontSize: '18px',
															}}
														>
															{(
																artistStore.artist?.user?.fullName?.charAt(0) || 'A'
															).toUpperCase()}
														</div>
														<div>
															<p
																style={{
																	fontWeight: '600',
																	color: '#1e3c72',
																	fontSize: '1.1rem',
																}}
															>
																{artistStore.artist?.user?.fullName || 'Unknown Artist'}
															</p>
															<p style={{ color: '#666', fontSize: '0.9rem' }}>
																Level: {artistStore.artist?.level || 'N/A'} •
																Experience: {artistStore.artist?.yearsOfExperience || 0}{' '}
																years
															</p>
														</div>
													</div>
													<div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
														<p
															style={{
																padding: '5px 12px',
																borderRadius: '20px',
																background: 'rgba(36, 191, 221, 0.1)',
																color: '#24BFDD',
																fontSize: '0.9rem',
															}}
														>
															Working Date: {artistStore.workingDate}
														</p>
														<p
															style={{
																padding: '5px 12px',
																borderRadius: '20px',
																background: 'rgba(156, 39, 176, 0.1)',
																color: '#9c27b0',
																fontSize: '0.9rem',
															}}
														>
															Hours: {artistStore.startTime} - {artistStore.endTime}
														</p>
													</div>
												</div>
											))}
										</div>
									) : (
										<p style={{ color: '#999', fontStyle: 'italic' }}>
											No artists currently assigned to this store
										</p>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

export default Home;