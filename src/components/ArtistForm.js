import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/AddArtist.css';

function AddArtistForm() {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(false);
	const [formData, setFormData] = useState({
		Level: 3,
		YearsOfExperience: 3,
		StoreId: '1975a76e-f637-42d1-bf1b-96edeceb1b9f',
		FullName: '',
		NewImage: null,
		ImageUrl: '',
		PhoneNumber: '',
		DateOfBirth: '',
	});

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData({
			...formData,
			[name]: value,
		});
	};

	const handleFileChange = (e) => {
		setFormData({
			...formData,
			NewImage: e.target.files[0],
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		try {
			// Create FormData object for the API request
			const apiFormData = new FormData();

			// Add all form fields to the FormData object
			Object.keys(formData).forEach((key) => {
				if (key === 'NewImage' && formData[key]) {
					apiFormData.append(key, formData[key]);
				} else if (key === 'ServiceIds' && formData[key].length > 0) {
					// Handle array data for ServiceIds
					formData[key].forEach((id) => {
						apiFormData.append(`${key}[]`, id);
					});
				} else if (formData[key] !== null && formData[key] !== '') {
					apiFormData.append(key, formData[key]);
				}
			});

			// Send POST request to create a new artist
			const response = await fetch(
				'https://inbsapi-d9hhfmhsapgabrcz.southeastasia-01.azurewebsites.net/api/Artist',
				{
					method: 'POST',
					body: apiFormData,
					// No Content-Type header - browser will set it with boundary for FormData
				}
			);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || 'Failed to create artist');
			}

			// Handle successful response
			setSuccess(true);
			setFormData({
				Level: 3,
				YearsOfExperience: 3,
				StoreId: '1975a76e-f637-42d1-bf1b-96edeceb1b9f',
				ServiceIds: [],
				FullName: '',
				NewImage: null,
				ImageUrl: '',
				PhoneNumber: '',
				DateOfBirth: '',
			});

			// Hide success message after 3 seconds
			setTimeout(() => {
				setSuccess(false);
			}, 3000);
		} catch (err) {
			console.error('Error creating artist:', err);
			setError(err.message || 'An error occurred while creating the artist.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='add-artist-container'>
			<h2>Add New Artist</h2>

			{success && <div className='success-message'>Artist created successfully!</div>}

			{error && <div className='error-message'>{error}</div>}

			<form onSubmit={handleSubmit} className='artist-form'>
				<div className='form-group'>
					<label htmlFor='fullName'>Full Name*</label>
					<input
						type='text'
						id='fullName'
						name='FullName'
						value={formData.FullName}
						onChange={handleInputChange}
						required
						placeholder="Enter artist's full name"
					/>
				</div>

				<div className='form-row'>
					<div className='form-group'>
						<label htmlFor='level'>Level*</label>
						<select id='level' name='Level' value={formData.Level} onChange={handleInputChange} required>
							<option value={1}>Level 1</option>
							<option value={2}>Level 2</option>
							<option value={3}>Level 3</option>
							<option value={4}>Level 4</option>
							<option value={5}>Level 5</option>
						</select>
					</div>

					<div className='form-group'>
						<label htmlFor='yearsOfExperience'>Years of Experience*</label>
						<input
							type='number'
							id='yearsOfExperience'
							name='YearsOfExperience'
							value={formData.YearsOfExperience}
							onChange={handleInputChange}
							required
							min='0'
							max='50'
						/>
					</div>
				</div>

				<div className='form-group'>
					<label htmlFor='phoneNumber'>Phone Number*</label>
					<input
						type='tel'
						id='phoneNumber'
						name='PhoneNumber'
						value={formData.PhoneNumber}
						onChange={handleInputChange}
						required
						placeholder='Enter phone number'
					/>
				</div>

				<div className='form-group'>
					<label htmlFor='dateOfBirth'>Date of Birth*</label>
					<input
						type='date'
						id='dateOfBirth'
						name='DateOfBirth'
						value={formData.DateOfBirth}
						onChange={handleInputChange}
						required
					/>
				</div>

				<div className='form-group'>
					<label htmlFor='storeId'>Store ID*</label>
					<input
						type='text'
						id='storeId'
						name='StoreId'
						value={formData.StoreId}
						onChange={handleInputChange}
						required
						placeholder='Store ID'
					/>
				</div>

				<div className='form-group'>
					<label htmlFor='newImage'>Profile Image</label>
					<input type='file' id='newImage' name='NewImage' onChange={handleFileChange} accept='image/*' />
				</div>

				<div className='form-group'>
					<label htmlFor='imageUrl'>Image URL (Optional)</label>
					<input
						type='url'
						id='imageUrl'
						name='ImageUrl'
						value={formData.ImageUrl}
						onChange={handleInputChange}
						placeholder='Enter image URL'
					/>
				</div>

				<div className='form-actions'>
					<button type='button' className='cancel-btn' onClick={() => navigate('/')}>
						Cancel
					</button>
					<button type='submit' className='submit-btn' disabled={loading}>
						{loading ? 'Creating Artist...' : 'Create Artist'}
					</button>
				</div>
			</form>
		</div>
	);
}

export default AddArtistForm;