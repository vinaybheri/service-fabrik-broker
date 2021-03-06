/*
Copyright 2019 The Service Fabrik Authors.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
// Code generated by client-gen. DO NOT EDIT.

package v1alpha1

import (
	"time"

	v1alpha1 "github.com/cloudfoundry-incubator/service-fabrik-broker/interoperator/api/resource/v1alpha1"
	scheme "github.com/cloudfoundry-incubator/service-fabrik-broker/interoperator/pkg/client/clientset/versioned/scheme"
	v1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	types "k8s.io/apimachinery/pkg/types"
	watch "k8s.io/apimachinery/pkg/watch"
	rest "k8s.io/client-go/rest"
)

// SFClustersGetter has a method to return a SFClusterInterface.
// A group's client should implement this interface.
type SFClustersGetter interface {
	SFClusters(namespace string) SFClusterInterface
}

// SFClusterInterface has methods to work with SFCluster resources.
type SFClusterInterface interface {
	Create(*v1alpha1.SFCluster) (*v1alpha1.SFCluster, error)
	Update(*v1alpha1.SFCluster) (*v1alpha1.SFCluster, error)
	UpdateStatus(*v1alpha1.SFCluster) (*v1alpha1.SFCluster, error)
	Delete(name string, options *v1.DeleteOptions) error
	DeleteCollection(options *v1.DeleteOptions, listOptions v1.ListOptions) error
	Get(name string, options v1.GetOptions) (*v1alpha1.SFCluster, error)
	List(opts v1.ListOptions) (*v1alpha1.SFClusterList, error)
	Watch(opts v1.ListOptions) (watch.Interface, error)
	Patch(name string, pt types.PatchType, data []byte, subresources ...string) (result *v1alpha1.SFCluster, err error)
	SFClusterExpansion
}

// sFClusters implements SFClusterInterface
type sFClusters struct {
	client rest.Interface
	ns     string
}

// newSFClusters returns a SFClusters
func newSFClusters(c *ResourceV1alpha1Client, namespace string) *sFClusters {
	return &sFClusters{
		client: c.RESTClient(),
		ns:     namespace,
	}
}

// Get takes name of the sFCluster, and returns the corresponding sFCluster object, and an error if there is any.
func (c *sFClusters) Get(name string, options v1.GetOptions) (result *v1alpha1.SFCluster, err error) {
	result = &v1alpha1.SFCluster{}
	err = c.client.Get().
		Namespace(c.ns).
		Resource("sfclusters").
		Name(name).
		VersionedParams(&options, scheme.ParameterCodec).
		Do().
		Into(result)
	return
}

// List takes label and field selectors, and returns the list of SFClusters that match those selectors.
func (c *sFClusters) List(opts v1.ListOptions) (result *v1alpha1.SFClusterList, err error) {
	var timeout time.Duration
	if opts.TimeoutSeconds != nil {
		timeout = time.Duration(*opts.TimeoutSeconds) * time.Second
	}
	result = &v1alpha1.SFClusterList{}
	err = c.client.Get().
		Namespace(c.ns).
		Resource("sfclusters").
		VersionedParams(&opts, scheme.ParameterCodec).
		Timeout(timeout).
		Do().
		Into(result)
	return
}

// Watch returns a watch.Interface that watches the requested sFClusters.
func (c *sFClusters) Watch(opts v1.ListOptions) (watch.Interface, error) {
	var timeout time.Duration
	if opts.TimeoutSeconds != nil {
		timeout = time.Duration(*opts.TimeoutSeconds) * time.Second
	}
	opts.Watch = true
	return c.client.Get().
		Namespace(c.ns).
		Resource("sfclusters").
		VersionedParams(&opts, scheme.ParameterCodec).
		Timeout(timeout).
		Watch()
}

// Create takes the representation of a sFCluster and creates it.  Returns the server's representation of the sFCluster, and an error, if there is any.
func (c *sFClusters) Create(sFCluster *v1alpha1.SFCluster) (result *v1alpha1.SFCluster, err error) {
	result = &v1alpha1.SFCluster{}
	err = c.client.Post().
		Namespace(c.ns).
		Resource("sfclusters").
		Body(sFCluster).
		Do().
		Into(result)
	return
}

// Update takes the representation of a sFCluster and updates it. Returns the server's representation of the sFCluster, and an error, if there is any.
func (c *sFClusters) Update(sFCluster *v1alpha1.SFCluster) (result *v1alpha1.SFCluster, err error) {
	result = &v1alpha1.SFCluster{}
	err = c.client.Put().
		Namespace(c.ns).
		Resource("sfclusters").
		Name(sFCluster.Name).
		Body(sFCluster).
		Do().
		Into(result)
	return
}

// UpdateStatus was generated because the type contains a Status member.
// Add a +genclient:noStatus comment above the type to avoid generating UpdateStatus().

func (c *sFClusters) UpdateStatus(sFCluster *v1alpha1.SFCluster) (result *v1alpha1.SFCluster, err error) {
	result = &v1alpha1.SFCluster{}
	err = c.client.Put().
		Namespace(c.ns).
		Resource("sfclusters").
		Name(sFCluster.Name).
		SubResource("status").
		Body(sFCluster).
		Do().
		Into(result)
	return
}

// Delete takes name of the sFCluster and deletes it. Returns an error if one occurs.
func (c *sFClusters) Delete(name string, options *v1.DeleteOptions) error {
	return c.client.Delete().
		Namespace(c.ns).
		Resource("sfclusters").
		Name(name).
		Body(options).
		Do().
		Error()
}

// DeleteCollection deletes a collection of objects.
func (c *sFClusters) DeleteCollection(options *v1.DeleteOptions, listOptions v1.ListOptions) error {
	var timeout time.Duration
	if listOptions.TimeoutSeconds != nil {
		timeout = time.Duration(*listOptions.TimeoutSeconds) * time.Second
	}
	return c.client.Delete().
		Namespace(c.ns).
		Resource("sfclusters").
		VersionedParams(&listOptions, scheme.ParameterCodec).
		Timeout(timeout).
		Body(options).
		Do().
		Error()
}

// Patch applies the patch and returns the patched sFCluster.
func (c *sFClusters) Patch(name string, pt types.PatchType, data []byte, subresources ...string) (result *v1alpha1.SFCluster, err error) {
	result = &v1alpha1.SFCluster{}
	err = c.client.Patch(pt).
		Namespace(c.ns).
		Resource("sfclusters").
		SubResource(subresources...).
		Name(name).
		Body(data).
		Do().
		Into(result)
	return
}
